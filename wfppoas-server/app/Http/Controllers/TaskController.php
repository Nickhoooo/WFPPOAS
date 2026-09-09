<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index($projectId)
    {
        $tasks = Task::where('project_id', $projectId)
            ->with(['employee', 'documents'])
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

    // =========================
    // CREATE TASK
    // =========================
    public function store(Request $request, $projectId)
    {
        $project = Project::findOrFail($projectId);
        Gate::authorize('manage', $project);

        $validated = $request->validate([
            'milestone_id' => ['nullable', Rule::exists('milestones', 'id')->where('project_id', $projectId)],
            'assigned_to' => 'required|exists:users,id',
            'task_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high',
            'deadline' => 'nullable|date',
        ]);

        $validated['project_id'] = $projectId;
        $validated['status'] = 'pending';
        $validated['progress_percent'] = 0;

        // Make sure assigned employee belongs to project team
        if (!$project->team()->where('user_id', $validated['assigned_to'])->exists()) {
            return response()->json([
                'message' => 'Kailangan munang idagdag ang taong ito sa team ng project bago siya bigyan ng task.'
            ], 422);
        }

        $task = Task::create($validated);

        // =========================
        // NOTIFY EMPLOYEE
        // =========================
        Notification::create([
            'user_id' => $task->assigned_to,
            'project_id' => $task->project_id,
            'task_id' => $task->id,
            'message' => "You have been assigned the task \"{$task->task_name}\" for project \"{$project->project_name}\".",
            'type' => 'task_assigned',
            'is_read' => false,
        ]);

        return response()->json($task, 201);
    }

    // =========================
    // UPDATE TASK
    // =========================
    public function update(Request $request, $projectId, $id)
    {
        Gate::authorize('manage', Project::findOrFail($projectId));
        $task = Task::where('project_id', $projectId)->findOrFail($id);

        $oldAssignedTo = $task->assigned_to;

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

        // =========================
        // NOTIFY NEW ASSIGNEE
        // =========================
        if (
            array_key_exists('assigned_to', $validated) &&
            (int) $oldAssignedTo !== (int) $validated['assigned_to']
        ) {
            $project = Project::findOrFail($projectId);

            Notification::create([
                'user_id' => $task->assigned_to,
                'project_id' => $task->project_id,
                'task_id' => $task->id,
                'message' => "You have been assigned the task \"{$task->task_name}\" for project \"{$project->project_name}\".",
                'type' => 'task_assigned',
                'is_read' => false,
            ]);
        }

        return response()->json($task);
    }

    // =========================
    // EMPLOYEE UPDATE PROGRESS
    // =========================
    public function updateProgress(Request $request, $projectId, $id)
    {
        $task = Task::where('project_id', $projectId)
            ->findOrFail($id);

        // Assignment alone does not grant access after removal from the team.
        if ((int) $task->assigned_to !== (int) $request->user()->id
            || !$task->project->team()->where('users.id', $request->user()->id)->exists()) {
            return response()->json([
                'message' => 'Hindi mo maaaring i-update ang task na ito.'
            ], 403);
        }

        if (in_array($task->status, ['for_review', 'completed'], true)) {
            return response()->json([
                'message' => 'Hindi maaaring baguhin ang progress ng task na for review o completed na.'
            ], 422);
        }

        $validated = $request->validate([
            'progress_percent' => 'required|integer|min:0|max:100',
        ]);

        $progress = $validated['progress_percent'];

        $task->update([
            'progress_percent' => $progress,
            'status' => $progress > 0 ? 'in_progress' : 'pending',
        ]);

        return response()->json($task);
    }

    // =========================
    // EMPLOYEE SUBMITS TASK
    // =========================
    public function submitForReview(Request $request, $projectId, $id)
    {
        $task = Task::where('project_id', $projectId)
            ->findOrFail($id);

        // Only the assigned employee who is still on the team can submit.
        if ((int) $task->assigned_to !== (int) $request->user()->id
            || !$task->project->team()->where('users.id', $request->user()->id)->exists()) {
            return response()->json([
                'message' => 'Hindi mo maaaring i-submit ang task na ito.'
            ], 403);
        }

        // Only pending or in-progress tasks can be submitted
        if (!in_array($task->status, ['pending', 'in_progress'])) {
            return response()->json([
                'message' => 'Ang task na ito ay hindi maaaring i-submit sa kasalukuyang status.'
            ], 422);
        }

        $validated = $request->validate([
            'employee_comment' => 'nullable|string',
        ]);

        $task->update([
            'status' => 'for_review',
            'progress_percent' => 100,
            'employee_comment' => $validated['employee_comment'] ?? null,
        ]);

        // Get project
        $project = Project::findOrFail($projectId);

        // =========================
        // NOTIFY PROJECT MANAGER
        // =========================
        if ($project->manager_id) {
            $employeeName = $request->user()->name ?? 'An employee';

            Notification::create([
                'user_id' => $project->manager_id,
                'project_id' => $task->project_id,
                'task_id' => $task->id,
                'message' => "{$employeeName} submitted the task \"{$task->task_name}\" for review.",
                'type' => 'task_submitted',
                'is_read' => false,
            ]);
        }

        return response()->json($task);
    }

    // =========================
    // MANAGER APPROVES TASK
    // =========================
   // MANAGER APPROVES TASK
public function approve($projectId, $id)
{
    Gate::authorize('manage', Project::findOrFail($projectId));
    $task = Task::where('project_id', $projectId)
        ->findOrFail($id);

    if ($task->status !== 'for_review') {
        return response()->json([
            'message' => 'Only tasks submitted for review can be approved.'
        ], 422);
    }

    $task->update([
        'status' => 'completed',
        'completed_at' => now(),
    ]);

    Notification::create([
        'user_id' => $task->assigned_to,
        'message' => "Your task \"{$task->task_name}\" has been approved.",
        'type' => 'task_approved',
        'is_read' => false,
    ]);

    return response()->json($task);
}

    // =========================
    // MANAGER REJECTS TASK
    // =========================
    public function reject(Request $request, $projectId, $id)
    {
        Gate::authorize('manage', Project::findOrFail($projectId));
        $validated = $request->validate([
            'manager_comment' => 'required|string',
        ]);

        $task = Task::where('project_id', $projectId)
            ->findOrFail($id);

        if ($task->status !== 'for_review') {
            return response()->json([
                'message' => 'Only tasks submitted for review can be rejected.'
            ], 422);
        }

        $task->update([
            'status' => 'in_progress',
            'completed_at' => null,
            'manager_comment' => $validated['manager_comment'],
        ]);

        // =========================
        // NOTIFY EMPLOYEE
        // =========================
        Notification::create([
            'user_id' => $task->assigned_to,
            'project_id' => $task->project_id,
            'task_id' => $task->id,
            'message' => "Your task \"{$task->task_name}\" was rejected. Feedback: {$validated['manager_comment']}",
            'type' => 'task_rejected',
            'is_read' => false,
        ]);

        return response()->json($task);
    }

    // =========================
    // DELETE TASK
    // =========================
    public function destroy($projectId, $id)
    {
        Gate::authorize('manage', Project::findOrFail($projectId));
        $task = Task::where('project_id', $projectId)
            ->findOrFail($id);

        $task->delete();

        return response()->json([
            'message' => 'Na-delete na ang task.'
        ]);
    }

    // =========================
    // EMPLOYEE MY TASKS
    // =========================
    public function myTasks(Request $request)
    {
        $tasks = Task::where('assigned_to', $request->user()->id)
            ->whereHas('project.team', function ($query) use ($request) {
                $query->where('users.id', $request->user()->id);
            })
            ->with(['project', 'documents'])
            ->orderBy('deadline')
            ->get();

        return response()->json($tasks);
    }
}
