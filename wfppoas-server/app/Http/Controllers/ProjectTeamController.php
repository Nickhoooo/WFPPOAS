<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

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

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        if ($project->team()->where('user_id', $validated['user_id'])->exists()) {
            return response()->json(['message' => 'Kasama na siya sa team ng project na ito.'], 409);
        }

        $project->team()->attach($validated['user_id']);

        return response()->json($project->team, 201);
    }

    public function destroy($projectId, $userId)
    {
        $project = Project::findOrFail($projectId);
        $project->team()->detach($userId);

        return response()->json(['message' => 'Naalis na siya sa team.']);
    }
}
