<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProjectController extends Controller
{
    public function search(Request $request)
    {
        $request->validate(['q' => 'nullable|string|max:100']);
        $term = trim($request->input('q', ''));
        $user = $request->user();
        abort_unless(in_array($user->role, ['admin', 'manager', 'employee'], true), 403);
        if (mb_strlen($term) < 2) {
            return response()->json([]);
        }

        $projects = Project::query();
        // Preserve existing admin/manager read access; employees only see their teams.
        if ($user->role === 'employee') {
            $projects->whereHas('team', fn ($query) => $query->where('users.id', $user->id));
        }
        // Escape LIKE wildcards so typed percent/underscore characters are literal.
        $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $term).'%';
        return response()->json($projects
            ->whereRaw("LOWER(project_name) LIKE ? ESCAPE '!'", [mb_strtolower($pattern)])
            ->orderBy('project_name')->orderBy('id')->limit(8)
            ->get(['id', 'project_name', 'status']));
    }

    public function index()
    {
        $projects = Project::with('manager')->get();

        return response()->json($projects);
    }

    public function show($id)
    {
        $project = Project::with([
            'manager',
            'milestones',
            'tasks'
        ])->findOrFail($id);

        return response()->json($project);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_name' => 'required|string|max:255',
            'client_name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|in:ongoing,on-hold,completed',
        ]);

        $validated['manager_id'] = $request->user()->id;

        $project = DB::transaction(function () use ($validated, $request) {
        $project = Project::create($validated);

        // Automatically add the project manager to the project team.
        $project->team()->syncWithoutDetaching([
            $request->user()->id
        ]);
        Notification::notifyAdmins($request->user(), 'project_created',
            "{$request->user()->name} created the project \"{$project->project_name}\".",
            ['project_id' => $project->id]);
        return $project;
        });

        return response()->json($project, 201);
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        Gate::authorize('manage', $project);

        $validated = $request->validate([
            'project_name' => 'sometimes|string|max:255',
            'client_name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'sometimes|in:ongoing,on-hold,completed',
        ]);

        $project = DB::transaction(function () use ($id, $validated, $request) {
            $project = Project::lockForUpdate()->findOrFail($id);
            Gate::authorize('manage', $project);
            $previousStatus = $project->status;
            $project->update($validated);
            if ($previousStatus !== 'completed' && $project->status === 'completed') {
                Notification::notifyAdmins($request->user(), 'project_completed',
                    "\"{$project->project_name}\" was marked completed by {$request->user()->name}.",
                    ['project_id' => $project->id]);
            }
            return $project;
        });

        return response()->json($project);
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        Gate::authorize('manage', $project);

        $project->delete();

        return response()->json([
            'message' => 'Na-delete ang project.'
        ]);
    }

    public function myProjects(Request $request)
    {
        $userId = $request->user()->id;

        $projects = Project::whereHas('team', function ($query) use ($userId) {
            $query->where('users.id', $userId);
        })
        ->with(['manager', 'team'])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($projects);
    }
}
