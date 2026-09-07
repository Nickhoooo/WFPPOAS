<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\MilestoneController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\EmployeeProfileController;
use App\Http\Controllers\AdminProfileController;
use App\Http\Controllers\ManagerProfileController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PerformanceRecordController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\ProjectTeamController;

Route::get('/hello', function () {
    return response()->json(['message' => 'Hello from Laravel!']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/invitations/{token}', [InvitationController::class, 'show']);
Route::post('/invitations/{token}/setup', [InvitationController::class, 'setup']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin-only routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/test', function () {
            return response()->json(['message' => 'Kumusta Admin! Pumasok ka.']);
        });

        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users/invite', [UserController::class, 'invite']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        Route::get('/dashboard/admin', [DashboardController::class, 'adminSummary']);

        Route::get('/dashboard/activity', [DashboardController::class, 'recentActivity']);
        Route::get('/documents', [DocumentController::class, 'allDocuments']);
    });

    // Admin + Manager routes
    Route::middleware('role:admin,manager')->group(function () {
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::get('/projects/{id}', [ProjectController::class, 'show']);
        Route::post('/projects', [ProjectController::class, 'store']);
        Route::put('/projects/{id}', [ProjectController::class, 'update']);
        Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

        Route::get('/projects/{projectId}/milestones', [MilestoneController::class, 'index']);
        Route::get('/projects/{projectId}/milestones/{id}', [MilestoneController::class, 'show']);
        Route::post('/projects/{projectId}/milestones', [MilestoneController::class, 'store']);
        Route::put('/projects/{projectId}/milestones/{id}', [MilestoneController::class, 'update']);
        Route::delete('/projects/{projectId}/milestones/{id}', [MilestoneController::class, 'destroy']);

        Route::get('/projects/{projectId}/tasks', [TaskController::class, 'index']);
        Route::get('/projects/{projectId}/tasks/{id}', [TaskController::class, 'show']);
        Route::post('/projects/{projectId}/tasks', [TaskController::class, 'store']);
        Route::put('/projects/{projectId}/tasks/{id}', [TaskController::class, 'update']);
        Route::delete('/projects/{projectId}/tasks/{id}', [TaskController::class, 'destroy']);
        Route::post('/projects/{projectId}/tasks/{id}/approve', [TaskController::class, 'approve']);
        Route::post('/projects/{projectId}/tasks/{id}/reject', [TaskController::class, 'reject']);

        Route::get('/users/{userId}/performance', [PerformanceRecordController::class, 'index']);
        Route::post('/users/{userId}/performance', [PerformanceRecordController::class, 'store']);

        Route::get('/dashboard/manager', [DashboardController::class, 'managerSummary']);

        Route::get('/projects/{projectId}/team', [ProjectTeamController::class, 'index']);
        Route::post('/projects/{projectId}/team', [ProjectTeamController::class, 'store']);
        Route::delete('/projects/{projectId}/team/{userId}', [ProjectTeamController::class, 'destroy']);

        Route::post('/users/{userId}/performance/compute', [PerformanceRecordController::class, 'compute']);

        Route::get('/projects/{projectId}/available-employees',
        [ProjectTeamController::class, 'availableEmployees']);

        Route::get('/employees', [UserController::class, 'employees']);

        Route::get('/dashboard/performance-overview', [DashboardController::class, 'performanceOverview']);
    });

    // Available to everyone logged in (Admin, Manager, or Employee)

    // Task submission
    Route::post('/projects/{projectId}/tasks/{id}/submit', [TaskController::class, 'submitForReview']);

    // Profiles
    Route::get('/users/{userId}/employee-profile', [EmployeeProfileController::class, 'show']);
    Route::post('/users/{userId}/employee-profile', [EmployeeProfileController::class, 'store']);
    Route::put('/users/{userId}/employee-profile', [EmployeeProfileController::class, 'update']);

    Route::get('/users/{userId}/admin-profile', [AdminProfileController::class, 'show']);
    Route::post('/users/{userId}/admin-profile', [AdminProfileController::class, 'store']);
    Route::put('/users/{userId}/admin-profile', [AdminProfileController::class, 'update']);

    Route::get('/users/{userId}/manager-profile', [ManagerProfileController::class, 'show']);
    Route::post('/users/{userId}/manager-profile', [ManagerProfileController::class, 'store']);
    Route::put('/users/{userId}/manager-profile', [ManagerProfileController::class, 'update']);

    // Documents
    Route::get('/projects/{projectId}/documents', [DocumentController::class, 'index']);
    Route::post('/projects/{projectId}/documents', [DocumentController::class, 'store']);
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Employee dashboard
    Route::get('/dashboard/employee', [DashboardController::class, 'employeeSummary']);

    Route::get('/my-tasks', [TaskController::class, 'myTasks']);
});