<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index($projectId)
    {
        $tasks = Task::where('project_id', $projectId)
            ->with('employee')
            ->get();

        return response()->json($tasks);
    }

    public function show($projectId, $id)
    {
        $task = Task::where('project_id', $projectId)
            ->with(['employee', 'documents'])
            ->findOrFail($id);

        return response()->json($task);
    }

    public function store(Request $request, $projectId)
    {
        Project::findOrFail($projectId);

        $validated = $request->validate([
            'milestone_id' => 'nullable|exists:milestones,id',
            'assigned_to' => 'required|exists:users,id',
            'task_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high',
            'deadline' => 'nullable|date',
        ]);

        $validated['project_id'] = $projectId;
        $validated['status'] = 'pending';
        $validated['progress_percent'] = 0;

        $project = Project::findOrFail($projectId);

        if (!$project->team()->where('user_id', $validated['assigned_to'])->exists()) {
            return response()->json([
                'message' => 'Kailangan munang idagdag ang taong ito sa team ng project bago siya bigyan ng task.'
            ], 422);
        }
        $task = Task::create($validated);

        return response()->json($task, 201);
    }

    public function update(Request $request, $projectId, $id)
    {
        $task = Task::where('project_id', $projectId)->findOrFail($id);

        $validated = $request->validate([
            'assigned_to' => 'sometimes|exists:users,id',
            'task_name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:low,medium,high',
            'deadline' => 'nullable|date',
            'progress_percent' => 'sometimes|integer|min:0|max:100',
        ]);

        if (array_key_exists('assigned_to', $validated)) {
            $project = Project::findOrFail($projectId);

            if (!$project->team()->where('user_id', $validated['assigned_to'])->exists()) {
                return response()->json([
                    'message' => 'Kailangan munang idagdag ang taong ito sa team ng project bago siya bigyan ng task.'
                ], 422);
            }
        }

        $task->update($validated);

        return response()->json($task);
    }

    public function submitForReview(Request $request, $projectId, $id)
    {
        $task = Task::where('project_id', $projectId)->findOrFail($id);

        $task->update([
            'status' => 'for_review',
            'progress_percent' => 100,
        ]);

        return response()->json($task);
    }

    public function approve($projectId, $id)
    {
        $task = Task::where('project_id', $projectId)->findOrFail($id);

        $task->update([
            'status' => 'completed',
        ]);

        return response()->json($task);
    }

    public function reject(Request $request, $projectId, $id)
    {
        $validated = $request->validate([
            'manager_comment' => 'required|string',
        ]);

        $task = Task::where('project_id', $projectId)->findOrFail($id);

        $task->update([
            'status' => 'in_progress',
            'manager_comment' => $validated['manager_comment'],
        ]);

        return response()->json($task);
    }

    public function destroy($projectId, $id)
    {
        $task = Task::where('project_id', $projectId)->findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Na-delete na ang task.']);
    }
    // Sa TaskController.php, bagong function:

    public function myTasks(Request $request)
    {
        $tasks = Task::where('assigned_to', $request->user()->id)
            ->with('project')
            ->orderBy('deadline')
            ->get();

        return response()->json($tasks);
    }
}