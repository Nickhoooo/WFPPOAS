<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use App\Models\PerformanceRecord;

class DashboardController extends Controller
{
    public function adminSummary()
{
    return response()->json([
        'total_users' => User::count(),
        'total_admins' => User::where('role', 'admin')->count(),
        'total_managers' => User::where('role', 'manager')->count(),
        'total_employees' => User::where('role', 'employee')->count(),
        'active_users' => User::where('status', 'active')->count(),
        'total_tasks' => Task::count(),
        'completed_tasks' => Task::where('status', 'completed')->count(),
        'project_status' => [
            'on_track' => Project::where('status', 'ongoing')->count(),
            'delayed' => Project::where('status', 'on-hold')->count(),
            'completed' => Project::where('status', 'completed')->count(),
        ],
    ]);
}

    public function managerSummary(Request $request)
    {
        $managerId = $request->user()->id;

        return response()->json([
            'total_projects' => Project::where('manager_id', $managerId)->count(),
            'ongoing_projects' => Project::where('manager_id', $managerId)->where('status', 'ongoing')->count(),
            'completed_projects' => Project::where('manager_id', $managerId)->where('status', 'completed')->count(),
            'tasks_for_review' => Task::whereHas('project', function ($query) use ($managerId) {
                $query->where('manager_id', $managerId);
            })->where('status', 'for_review')->count(),
        ]);
    }

    public function employeeSummary(Request $request)
    {
        $employeeId = $request->user()->id;

        return response()->json([
            'total_tasks' => Task::where('assigned_to', $employeeId)->count(),
            'pending_tasks' => Task::where('assigned_to', $employeeId)->where('status', 'pending')->count(),
            'in_progress_tasks' => Task::where('assigned_to', $employeeId)->where('status', 'in_progress')->count(),
            'for_review_tasks' => Task::where('assigned_to', $employeeId)->where('status', 'for_review')->count(),
            'completed_tasks' => Task::where('assigned_to', $employeeId)->where('status', 'completed')->count(),
        ]);
    }

    public function recentActivity()
    {
        return response()->json(
            Notification::latest()->take(5)->get(['id', 'type', 'message', 'created_at'])
        );
    }

    public function performanceOverview()
    {
        $latestPerPerson = PerformanceRecord::selectRaw('MAX(id) as id')
            ->groupBy('user_id')
            ->pluck('id');

        $records = PerformanceRecord::whereIn('id', $latestPerPerson)
            ->with('user')
            ->get();

        $ranked = $records->sortByDesc('completion_rate')->values();

        $teamAverage = $records->avg('completion_rate');

        return response()->json([
            'top_performer' => $ranked->first(),
            'team_average' => round($teamAverage, 2),
            'ranking' => $ranked,
        ]);
    }
}