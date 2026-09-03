<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\PerformanceRecord;
use Illuminate\Http\Request;

class PerformanceRecordController extends Controller
{
    public function index($userId)
    {
        $records = PerformanceRecord::where('user_id', $userId)
            ->with('evaluator')
            ->get();

        return response()->json($records);
    }

    public function store(Request $request, $userId)
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'completion_rate' => 'nullable|numeric|min:0|max:100',
            'revision_count' => 'nullable|integer|min:0',
            'on_time_rate' => 'nullable|numeric|min:0|max:100',
            'period' => 'required|string|max:255',
        ]);

        $validated['user_id'] = $userId;
        $validated['evaluated_by'] = $request->user()->id;

        $record = PerformanceRecord::create($validated);

        return response()->json($record, 201);
    }

    public function compute(Request $request, $userId)
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'period' => 'required|string|max:255',
        ]);

        $query = Task::where('assigned_to', $userId);

        if (!empty($validated['project_id'])) {
            $query->where('project_id', $validated['project_id']);
        }

        $totalTasks = $query->count();

        $completedTasks = (clone $query)
            ->where('status', 'completed')
            ->count();

        $completionRate = $totalTasks > 0
            ? (float) round(($completedTasks / $totalTasks) * 100, 2)
            : 0.0;

        $onTimeCompleted = (clone $query)
            ->where('status', 'completed')
            ->whereColumn('updated_at', '<=', 'deadline')
            ->count();

        $onTimeRate = $completedTasks > 0
            ? (float) round(($onTimeCompleted / $completedTasks) * 100, 2)
            : 0.0;

        $revisionCount = (clone $query)
            ->whereNotNull('manager_comment')
            ->count();

        $record = PerformanceRecord::create([
            'user_id' => $userId,
            'project_id' => $validated['project_id'] ?? null,
            'completion_rate' => $completionRate,
            'on_time_rate' => $onTimeRate,
            'revision_count' => $revisionCount,
            'evaluated_by' => $request->user()->id,
            'period' => $validated['period'],
        ]);

        return response()->json($record, 201);
    }
}