<?php

namespace App\Http\Controllers;

use App\Models\Milestone;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class MilestoneController extends Controller
{
    public function index($projectId)
    {
        $milestones = Milestone::where('project_id', $projectId)
            ->orderBy('order')
            ->get();

        return response()->json($milestones);
    }

    public function show($projectId, $id)
    {
        $milestone = Milestone::where('project_id', $projectId)->findOrFail($id);
        return response()->json($milestone);
    }

    public function store(Request $request, $projectId)
    {
        $project = Project::findOrFail($projectId);
        Gate::authorize('manage', $project);

        $validated = $request->validate([
            'phase_name' => 'required|string|max:255',
            'order' => 'required|integer',
            'status' => 'nullable|in:not_started,in_progress,completed',
            'due_date' => 'nullable|date',
        ]);

        $validated['project_id'] = $projectId;

        $milestone = Milestone::create($validated);

        return response()->json($milestone, 201);
    }

    public function update(Request $request, $projectId, $id)
    {
        Gate::authorize('manage', Project::findOrFail($projectId));
        $milestone = Milestone::where('project_id', $projectId)->findOrFail($id);

        $validated = $request->validate([
            'phase_name' => 'sometimes|string|max:255',
            'order' => 'sometimes|integer',
            'status' => 'sometimes|in:not_started,in_progress,completed',
            'due_date' => 'nullable|date',
        ]);

        $milestone->update($validated);

        return response()->json($milestone);
    }

    public function destroy($projectId, $id)
    {
        Gate::authorize('manage', Project::findOrFail($projectId));
        $milestone = Milestone::where('project_id', $projectId)->findOrFail($id);
        $milestone->delete();

        return response()->json(['message' => 'Na-delete na ang milestone.']);
    }
}
