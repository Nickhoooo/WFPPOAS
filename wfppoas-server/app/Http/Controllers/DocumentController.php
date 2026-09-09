<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;

class DocumentController extends Controller
{
    /**
     * Check whether the current user can access a project.
     */
    private function canAccessProject(Request $request, Project $project)
    {
        $user = $request->user();

        // Admin can access all projects.
        if ($user->role === 'admin') {
            return true;
        }

        // Manager can access projects they manage.
        if ($user->role === 'manager') {
            return (int) $project->manager_id === (int) $user->id;
        }

        // Employee can access projects where they are a team member.
        if ($user->role === 'employee') {
            return $project->team()
                ->where('users.id', $user->id)
                ->exists();
        }

        return false;
    }

    /**
     * Get documents for a project.
     */
    public function index(Request $request, $projectId)
    {
        $project = Project::findOrFail($projectId);

        if (!$this->canAccessProject($request, $project)) {
            return response()->json([
                'message' => 'Hindi ka kabilang sa project na ito.'
            ], 403);
        }

        $documents = Document::where('project_id', $projectId)
            ->with(['uploader', 'task'])
            ->latest()
            ->get();

        return response()->json($documents);
    }

    /**
     * Upload a document to a project.
     */
    public function store(Request $request, $projectId)
    {
        $project = Project::findOrFail($projectId);

        if (!$this->canAccessProject($request, $project)) {
            return response()->json([
                'message' => 'Hindi ka maaaring mag-upload sa project na ito.'
            ], 403);
        }

        $validated = $request->validate([
            'task_id' => 'nullable|exists:tasks,id',
            'file' => 'required|file|max:10240',
            'file_type' => 'required|in:drawing,photo,permit',
        ]);

        // If a task was selected, make sure it belongs to this project.
        if (!empty($validated['task_id'])) {
            $taskBelongsToProject = $project->tasks()
                ->where('id', $validated['task_id'])
                ->exists();

            if (!$taskBelongsToProject) {
                return response()->json([
                    'message' => 'Ang selected task ay hindi kabilang sa project na ito.'
                ], 422);
            }
        }

        $path = $request->file('file')->store('documents', 'local');
        abort_unless($path, 500, 'Hindi na-save ang file. Subukan muli.');

        $document = Document::create([
            'project_id' => $projectId,
            'task_id' => $validated['task_id'] ?? null,
            'uploaded_by' => $request->user()->id,
            'file_path' => $path,
            'file_type' => $validated['file_type'],
            'version' => 1,
        ]);

        $document->load(['uploader', 'task']);

        return response()->json($document, 201);
    }

    /**
     * Delete a document.
     */
    public function destroy(Request $request, $id)
    {
        $document = Document::findOrFail($id);

        $project = Project::findOrFail($document->project_id);

        Gate::authorize('manage', $project);

        // Delete the actual file from storage.
        if ($document->file_path) {
            abort_unless(Storage::disk('local')->delete($document->file_path), 500, 'Hindi na-delete ang file. Subukan muli.');
        }

        $document->delete();

        return response()->json([
            'message' => 'Na-delete na ang document.'
        ]);
    }

    /**
     * Download a private file after checking current project access.
     */
    public function download(Request $request, $id)
    {
        $document = Document::findOrFail($id);
        $project = Project::findOrFail($document->project_id);
        abort_unless($this->canAccessProject($request, $project), 403, 'Hindi ka kabilang sa project na ito.');
        abort_unless(Storage::disk('local')->exists($document->file_path), 404, 'Hindi makita ang file.');

        return Storage::disk('local')->download($document->file_path, basename($document->file_path), [
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    /**
     * Get latest documents for Admin.
     */
    public function allDocuments(Request $request)
    {
        $documents = Document::with(['project', 'uploader', 'task'])
            ->latest()
            ->take(10)
            ->get();

        return response()->json($documents);
    }
}
