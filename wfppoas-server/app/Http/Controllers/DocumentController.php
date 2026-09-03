<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Task;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function index($projectId)
    {
        $documents = Document::where('project_id', $projectId)
            ->with('uploader')
            ->get();

        return response()->json($documents);
    }

    public function store(Request $request, $projectId)
    {
        $validated = $request->validate([
            'task_id' => 'nullable|exists:tasks,id',
            'file' => 'required|file|max:10240',
            'file_type' => 'required|in:drawing,photo,permit',
        ]);

        $path = $request->file('file')->store('documents', 'public');

        $document = Document::create([
            'project_id' => $projectId,
            'task_id' => $validated['task_id'] ?? null,
            'uploaded_by' => $request->user()->id,
            'file_path' => $path,
            'file_type' => $validated['file_type'],
            'version' => 1,
        ]);

        return response()->json($document, 201);
    }

    public function destroy($id)
    {
        $document = Document::findOrFail($id);
        $document->delete();

        return response()->json(['message' => 'Na-delete na ang document.']);
    }

    public function allDocuments()
    {
    $documents = Document::with(['project', 'uploader'])
        ->latest()
        ->take(10)
        ->get();

    return response()->json($documents);
    }
}