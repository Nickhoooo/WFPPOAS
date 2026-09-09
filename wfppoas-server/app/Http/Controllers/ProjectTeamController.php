<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProjectTeamController extends Controller
{
    public function index($projectId)
    {
        $project = Project::findOrFail($projectId);
        return response()->json($project->team);
    }

    public function store(Request $request, $projectId)
    {
        $project = Project::findOrFail($projectId);
        Gate::authorize('manage', $project);

        $validated = $request->validate([
            'user_id' => [
                'required',
                'exists:users,id',
                function ($attribute, $value, $fail) {
                    $user = \App\Models\User::find($value);

                    if (!$user || $user->role !== 'employee') {
                        $fail('Employee accounts only can be added to a project team.');
                    }
                },
            ],
        ]);

        if ($project->team()->where('user_id', $validated['user_id'])->exists()) {
            return response()->json(['message' => 'Kasama na siya sa team ng project na ito.'], 409);
        }

        $project->team()->attach($validated['user_id']);

        return response()->json($project->team, 201);
    }

    public function employees($projectId)
    {
        $project = Project::findOrFail($projectId);

        $employees = $project->team()
            ->where('role', 'employee')
            ->get();

        return response()->json($employees);
    }

    public function destroy($projectId, $userId)
    {
        $project = Project::findOrFail($projectId);
        Gate::authorize('manage', $project);

        // The project manager cannot be removed from the project team.
        if ((int) $project->manager_id === (int) $userId) {
            return response()->json([
                'message' => 'Hindi maaaring alisin ang project manager sa team.'
            ], 422);
        }

        $project->team()->detach($userId);

        return response()->json([
            'message' => 'Naalis na siya sa team.'
        ]);
    }
    
    public function availableEmployees($projectId)
    {
        $project = Project::findOrFail($projectId);

        $teamMemberIds = $project->team()
            ->pluck('users.id');

        $employees = \App\Models\User::where('role', 'employee')
            ->whereNotIn('id', $teamMemberIds)
            ->get();

        return response()->json($employees);
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
