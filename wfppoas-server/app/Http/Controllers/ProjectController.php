<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProjectController extends Controller
{
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

        $project = Project::create($validated);

        // Automatically add the project manager to the project team.
        $project->team()->syncWithoutDetaching([
            $request->user()->id
        ]);

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

        $project->update($validated);

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
