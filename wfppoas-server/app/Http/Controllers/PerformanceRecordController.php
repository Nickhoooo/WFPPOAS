<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\PerformanceRecord;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PerformanceRecordController extends Controller
{
    public function index(Request $request, $userId)
    {
        $validated = $request->validate(['project_id' => 'nullable|exists:projects,id']);
        if (!empty($validated['project_id'])) {
            Gate::authorize('manage', Project::findOrFail($validated['project_id']));
        }
        $records = PerformanceRecord::where('user_id', $userId)
            ->visibleTo($request->user())
            ->when(!empty($validated['project_id']), fn ($query) => $query->where('project_id', $validated['project_id']))
            ->with('evaluator')
            ->orderByDesc('period')
            ->get();

        return response()->json($records);
    }

    public function store(Request $request, $userId)
    {
        $validated = $request->validate([
            'project_id' => ($request->user()->role === 'manager' ? 'required' : 'nullable').'|exists:projects,id',
            'completion_rate' => 'nullable|numeric|min:0|max:100',
            'revision_count' => 'nullable|integer|min:0',
            'on_time_rate' => 'nullable|numeric|min:0|max:100',
            'period' => 'required|date_format:Y-m',
        ]);

        $this->authorizeEvaluation($request, $userId, $validated['project_id'] ?? null);
        $validated['user_id'] = $userId;
        $validated['evaluated_by'] = $request->user()->id;

        $record = PerformanceRecord::create($validated);

        return response()->json($record, 201);
    }

    public function compute(Request $request, $userId)
{
    $validated = $request->validate([
        'project_id' => ($request->user()->role === 'manager' ? 'required' : 'nullable').'|exists:projects,id',
        'period' => 'required|date_format:Y-m',
    ]);

    $this->authorizeEvaluation($request, $userId, $validated['project_id'] ?? null);

    $periodStart = Carbon::createFromFormat(
        'Y-m',
        $validated['period']
    )->startOfMonth();

    $periodEnd = Carbon::createFromFormat(
        'Y-m',
        $validated['period']
    )->endOfMonth();

    /*
    |--------------------------------------------------------------------------
    | Get tasks that were active during the selected month
    |--------------------------------------------------------------------------
    |
    | A task is included if:
    | - It was created on or before the end of the month
    | - And it was not completed before the beginning of the month
    |
    */

    $query = Task::where('assigned_to', $userId)
        ->where('created_at', '<=', $periodEnd)
        ->where(function ($q) use ($periodStart) {
            $q->whereNull('completed_at')
              ->orWhere('completed_at', '>=', $periodStart);
        });

    if (!empty($validated['project_id'])) {
        $query->where('project_id', $validated['project_id']);
    }

    $totalTasks = (clone $query)->count();

    $completedTasks = (clone $query)
        ->where('status', 'completed')
        ->count();

    $completionRate = $totalTasks > 0
        ? round(($completedTasks / $totalTasks) * 100, 2)
        : 0;

    $onTimeCompleted = (clone $query)
        ->where('status', 'completed')
        ->whereNotNull('completed_at')
        ->whereNotNull('deadline')
        ->whereColumn('completed_at', '<=', 'deadline')
        ->count();

    $onTimeRate = $completedTasks > 0
        ? round(($onTimeCompleted / $completedTasks) * 100, 2)
        : 0;

    $revisionCount = (clone $query)
        ->whereNotNull('manager_comment')
        ->count();

    $record = PerformanceRecord::updateOrCreate(
        [
            'user_id' => $userId,
            'project_id' => $validated['project_id'] ?? null,
            'period' => $validated['period'],
        ],
        [
            'completion_rate' => $completionRate,
            'on_time_rate' => $onTimeRate,
            'revision_count' => $revisionCount,
            'evaluated_by' => $request->user()->id,
        ]
    );

    return response()->json($record, 201);
}

    private function authorizeEvaluation(Request $request, $userId, $projectId): void
    {
        $employee = User::findOrFail($userId);
        abort_unless($employee->role === 'employee', 422, 'Employee accounts only can be evaluated.');
        if ($projectId !== null) {
            $project = Project::findOrFail($projectId);
            Gate::authorize('manage', $project);
            // Keep historical evaluations possible for former team members with assigned work.
            abort_unless(
                $project->team()->where('users.id', $employee->id)->exists()
                || $project->tasks()->where('assigned_to', $employee->id)->exists(),
                422, 'The employee has no membership or assigned work in this project.'
            );
        }
    }
}
