<?php

namespace Tests\Feature;

use App\Models\Milestone;
use App\Models\Notification;
use App\Models\PerformanceRecord;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ProjectWorkAuthorizationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        app('db')->purge('sqlite');
        $this->artisan('migrate', ['--force' => true])->assertExitCode(0);

    }

    public function test_employee_access_requires_assignment_and_current_membership(): void
    {
        $owner = User::factory()->create(['role' => 'manager']);
        $employee = User::factory()->create(['role' => 'employee']);
        $other = User::factory()->create(['role' => 'employee']);
        $project = Project::create(['project_name' => 'A', 'client_name' => 'Client', 'manager_id' => $owner->id]);
        $project->team()->attach([$employee->id, $other->id]);
        $task = Task::create(['project_id' => $project->id, 'assigned_to' => $employee->id, 'task_name' => 'Assigned', 'status' => 'pending']);
        $url = '/api/projects/'.$project->id.'/tasks/'.$task->id;

        $this->actingAs($other, 'sanctum');
        $this->getJson('/api/my-tasks')->assertOk()->assertJsonCount(0);
        $this->putJson($url.'/progress', ['progress_percent' => 50])->assertForbidden();
        $this->postJson($url.'/submit')->assertForbidden();

        $this->actingAs($employee, 'sanctum');
        $this->getJson('/api/my-tasks')->assertOk()->assertJsonCount(1)->assertJsonPath('0.id', $task->id);
        $this->getJson('/api/dashboard/employee')->assertOk()->assertJsonPath('total_tasks', 1)->assertJsonPath('pending_tasks', 1);
        $project->team()->detach($employee->id);
        $this->getJson('/api/my-tasks')->assertOk()->assertJsonCount(0);
        $this->getJson('/api/dashboard/employee')->assertOk()->assertExactJson([
            'total_tasks' => 0, 'pending_tasks' => 0, 'in_progress_tasks' => 0,
            'for_review_tasks' => 0, 'completed_tasks' => 0,
        ]);
        $this->putJson($url.'/progress', ['progress_percent' => 50])->assertForbidden();
        $this->postJson($url.'/submit', ['employee_comment' => 'Done'])->assertForbidden();
        $this->assertSame('pending', $task->fresh()->status);
        $this->assertEquals(0, $task->fresh()->progress_percent);
        $this->assertNull($task->fresh()->employee_comment);
        $this->assertSame(0, Notification::count());
    }

    public function test_employee_review_cycle_preserves_locked_tasks_and_allows_revisions(): void
    {
        $owner = User::factory()->create(['role' => 'manager']);
        $employee = User::factory()->create(['role' => 'employee']);
        $project = Project::create(['project_name' => 'A', 'client_name' => 'Client', 'manager_id' => $owner->id]);
        $project->team()->attach($employee->id);
        $task = Task::create(['project_id' => $project->id, 'assigned_to' => $employee->id, 'task_name' => 'Work', 'status' => 'pending']);
        $url = '/api/projects/'.$project->id.'/tasks/'.$task->id;
        $this->actingAs($employee, 'sanctum');
        $this->putJson($url.'/progress', ['progress_percent' => 101])->assertUnprocessable();
        $this->putJson($url.'/progress', ['progress_percent' => 50])->assertOk()->assertJsonPath('status', 'in_progress');
        $this->putJson($url.'/progress', ['progress_percent' => 0])->assertOk()->assertJsonPath('status', 'pending');
        $this->postJson($url.'/submit', ['employee_comment' => 'First submission'])->assertOk()->assertJsonPath('status', 'for_review');
        $this->assertDatabaseHas('notifications', ['user_id' => $owner->id, 'task_id' => $task->id, 'type' => 'task_submitted']);
        $this->putJson($url.'/progress', ['progress_percent' => 10])->assertUnprocessable();
        $this->postJson($url.'/submit', ['employee_comment' => 'Overwrite'])->assertUnprocessable();
        $this->assertSame('First submission', $task->fresh()->employee_comment);
        $this->assertSame('for_review', $task->fresh()->status);
        $this->assertEquals(100, $task->fresh()->progress_percent);
        $this->assertSame(1, Notification::count());

        // Simulate an old inconsistent timestamp; rejection must clear it.
        $task->refresh()->update(['completed_at' => now()->subDay()]);
        $this->actingAs($owner, 'sanctum');
        $this->postJson($url.'/reject', ['manager_comment' => 'Revise'])->assertOk();
        $this->assertNull($task->fresh()->completed_at);
        $this->actingAs($employee, 'sanctum');
        $this->putJson($url.'/progress', ['progress_percent' => 80])->assertOk();
        $this->postJson($url.'/submit', ['employee_comment' => 'Revised'])->assertOk();
        $this->actingAs($owner, 'sanctum');
        $this->postJson($url.'/approve')->assertOk();
        $completedAt = $task->fresh()->completed_at->toDateTimeString();

        $this->actingAs($employee, 'sanctum');
        $this->putJson($url.'/progress', ['progress_percent' => 0])->assertUnprocessable();
        $this->postJson($url.'/submit')->assertUnprocessable();
        $this->assertSame('completed', $task->fresh()->status);
        $this->assertEquals(100, $task->fresh()->progress_percent);
        $this->assertSame($completedAt, $task->fresh()->completed_at->toDateTimeString());
        $this->assertSame(4, Notification::count());
    }

    public function test_performance_reads_and_writes_are_scoped_to_managed_projects(): void
    {
        $owner = User::factory()->create(['role' => 'manager']);
        $other = User::factory()->create(['role' => 'manager']);
        $employee = User::factory()->create(['role' => 'employee']);
        $project = Project::create(['project_name' => 'A', 'client_name' => 'Client', 'manager_id' => $owner->id]);
        $foreign = Project::create(['project_name' => 'B', 'client_name' => 'Client', 'manager_id' => $other->id]);
        $project->team()->attach($employee->id);
        $foreign->team()->attach([$employee->id, $owner->id]);
        $ownRecord = PerformanceRecord::create(['user_id' => $employee->id, 'project_id' => $project->id, 'evaluated_by' => $owner->id, 'period' => '2026-09', 'completion_rate' => 25]);
        $foreignRecord = PerformanceRecord::create(['user_id' => $employee->id, 'project_id' => $foreign->id, 'evaluated_by' => $other->id, 'period' => '2026-09', 'completion_rate' => 90]);
        PerformanceRecord::create(['user_id' => $employee->id, 'evaluated_by' => $other->id, 'period' => '2026-09', 'completion_rate' => 99]);
        $url = '/api/users/'.$employee->id.'/performance';
        $this->actingAs($owner, 'sanctum');
        $this->getJson($url)->assertOk()->assertJsonCount(1)->assertJsonPath('0.id', $ownRecord->id);
        $this->getJson($url.'?project_id='.$foreign->id)->assertForbidden();
        $this->getJson('/api/dashboard/performance-overview')->assertOk()->assertJsonCount(1, 'ranking')->assertJsonPath('top_performer.id', $ownRecord->id);
        foreach (['', '/compute'] as $suffix) {
            $this->postJson($url.$suffix, ['period' => '2026-09'])->assertUnprocessable()->assertJsonValidationErrors('project_id');
            $this->postJson($url.$suffix, ['period' => '2026-09', 'project_id' => null])->assertUnprocessable();
            $this->postJson($url.$suffix, ['period' => '2026-09', 'project_id' => $foreign->id])->assertForbidden();
        }
        $this->assertSame(3, PerformanceRecord::count());
        $this->assertEquals(90, $foreignRecord->fresh()->completion_rate);
        $this->assertEquals($other->id, $foreignRecord->fresh()->evaluated_by);

        Task::create(['project_id' => $project->id, 'assigned_to' => $employee->id, 'task_name' => 'Done', 'status' => 'completed', 'completed_at' => '2026-09-05', 'deadline' => '2026-09-06', 'created_at' => '2026-09-01']);
        Task::create(['project_id' => $foreign->id, 'assigned_to' => $employee->id, 'task_name' => 'Pending', 'status' => 'pending', 'created_at' => '2026-09-01']);
        $this->postJson($url.'/compute', ['period' => '2026-09', 'project_id' => $project->id])->assertCreated();
        $this->assertEquals(100, $ownRecord->fresh()->completion_rate);
        $this->assertEquals(100, $ownRecord->fresh()->on_time_rate);
        $this->assertEquals(90, $foreignRecord->fresh()->completion_rate);
        $this->postJson($url, ['period' => '2026-08', 'project_id' => $project->id, 'completion_rate' => 60])->assertCreated();

        $outsider = User::factory()->create(['role' => 'employee']);
        foreach (['', '/compute'] as $suffix) {
            $this->postJson('/api/users/'.$outsider->id.'/performance'.$suffix, ['period' => '2026-09', 'project_id' => $project->id])->assertUnprocessable();
        }
        $project->team()->detach($employee->id);
        $this->postJson($url.'/compute', ['period' => '2026-09', 'project_id' => $project->id])->assertCreated();

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum');
        $this->getJson($url)->assertOk()->assertJsonCount(4);
        $this->getJson($url.'?project_id='.$foreign->id)->assertOk()->assertJsonCount(1);
        $this->postJson($url.'/compute', ['period' => '2026-09'])->assertCreated();
        $this->assertEquals(50, PerformanceRecord::whereNull('project_id')->first()->completion_rate);
        $this->postJson($url, ['period' => '2026-07', 'completion_rate' => 70])->assertCreated();
    }

    public static function actors(): array
    {
        return [['owner', true], ['admin', true], ['manager', false], ['employee', false], ['guest', false]];
    }

    #[DataProvider('actors')]
    public function test_work_mutations_and_notifications_respect_ownership(string $actor, bool $allowed): void
    {
        $owner = User::factory()->create(['role' => 'manager']);
        $employee = User::factory()->create(['role' => 'employee']);
        $replacement = User::factory()->create(['role' => 'employee']);
        $project = Project::create(['project_name' => 'A', 'client_name' => 'Client', 'manager_id' => $owner->id]);
        $project->team()->attach([$employee->id, $replacement->id]);
        if ($actor !== 'guest') {
            $user = $actor === 'owner' ? $owner : User::factory()->create(['role' => $actor]);
            $project->team()->syncWithoutDetaching([$user->id]);
            $this->actingAs($user, 'sanctum');
        }
        $url = '/api/projects/'.$project->id;
        $denied = $actor === 'guest' ? 401 : 403;
        $milestone = Milestone::create(['project_id' => $project->id, 'phase_name' => 'Original', 'order' => 1]);
        $task = Task::create(['project_id' => $project->id, 'assigned_to' => $employee->id, 'task_name' => 'Original', 'status' => 'for_review']);
        $taskUrl = $url.'/tasks/'.$task->id;

        $this->postJson($url.'/milestones', ['phase_name' => 'New', 'order' => 2])->assertStatus($allowed ? 201 : $denied);
        $this->assertSame($allowed ? 2 : 1, Milestone::count());
        $this->putJson($url.'/milestones/'.$milestone->id, ['phase_name' => 'Changed'])->assertStatus($allowed ? 200 : $denied);
        $this->assertSame($allowed ? 'Changed' : 'Original', $milestone->fresh()->phase_name);

        $this->postJson($url.'/tasks', ['task_name' => 'New', 'assigned_to' => $employee->id, 'milestone_id' => $milestone->id])->assertStatus($allowed ? 201 : $denied);
        $this->assertSame($allowed ? 2 : 1, Task::count());
        $this->putJson($taskUrl, ['task_name' => 'Changed', 'assigned_to' => $replacement->id])->assertStatus($allowed ? 200 : $denied);
        $this->assertSame($allowed ? 'Changed' : 'Original', $task->fresh()->task_name);
        $this->assertEquals($allowed ? $replacement->id : $employee->id, $task->fresh()->assigned_to);

        $this->postJson($taskUrl.'/approve')->assertStatus($allowed ? 200 : $denied);
        $this->assertSame($allowed ? 'completed' : 'for_review', $task->fresh()->status);
        $this->assertSame($allowed, $task->fresh()->completed_at !== null);
        if ($allowed) {
            $this->postJson($taskUrl.'/approve')->assertStatus(422);
            $task->refresh()->update(['status' => 'for_review', 'completed_at' => null]);
        }
        $this->postJson($taskUrl.'/reject', ['manager_comment' => 'Please revise'])->assertStatus($allowed ? 200 : $denied);
        $this->assertSame($allowed ? 'in_progress' : 'for_review', $task->fresh()->status);
        $this->assertSame($allowed ? 'Please revise' : null, $task->fresh()->manager_comment);
        $this->assertSame($allowed ? 4 : 0, Notification::count());
        if ($allowed) {
            $this->assertDatabaseHas('notifications', ['user_id' => $replacement->id, 'type' => 'task_approved']);
            $this->assertDatabaseHas('notifications', ['user_id' => $replacement->id, 'type' => 'task_rejected']);
            $this->postJson($taskUrl.'/reject', ['manager_comment' => 'Again'])->assertStatus(422);
        }
        $this->deleteJson($taskUrl)->assertStatus($allowed ? 200 : $denied);
        $this->assertSame(!$allowed, Task::whereKey($task->id)->exists());
        $this->deleteJson($url.'/milestones/'.$milestone->id)->assertStatus($allowed ? 200 : $denied);
        $this->assertSame(!$allowed, Milestone::whereKey($milestone->id)->exists());
    }

    public function test_cross_project_milestones_and_child_ids_are_rejected(): void
    {
        $owner = User::factory()->create(['role' => 'manager']);
        $employee = User::factory()->create(['role' => 'employee']);
        $project = Project::create(['project_name' => 'A', 'client_name' => 'Client', 'manager_id' => $owner->id]);
        $other = Project::create(['project_name' => 'B', 'client_name' => 'Client', 'manager_id' => $owner->id]);
        $project->team()->attach($employee->id);
        $milestone = Milestone::create(['project_id' => $other->id, 'phase_name' => 'Other', 'order' => 1]);
        $task = Task::create(['project_id' => $other->id, 'assigned_to' => $employee->id, 'task_name' => 'Other', 'status' => 'for_review']);
        $this->actingAs($owner, 'sanctum');
        $url = '/api/projects/'.$project->id;
        $this->postJson($url.'/tasks', ['task_name' => 'Invalid', 'assigned_to' => $employee->id, 'milestone_id' => $milestone->id])->assertUnprocessable()->assertJsonValidationErrors('milestone_id');
        $this->putJson($url.'/milestones/'.$milestone->id, ['phase_name' => 'Invalid'])->assertNotFound();
        $this->deleteJson($url.'/milestones/'.$milestone->id)->assertNotFound();
        $this->putJson($url.'/tasks/'.$task->id, ['task_name' => 'Invalid'])->assertNotFound();
        $this->deleteJson($url.'/tasks/'.$task->id)->assertNotFound();
        $this->postJson($url.'/tasks/'.$task->id.'/approve')->assertNotFound();
        $this->postJson($url.'/tasks/'.$task->id.'/reject', ['manager_comment' => 'Invalid'])->assertNotFound();
        $this->assertSame('Other', $milestone->fresh()->phase_name);
        $this->assertSame('for_review', $task->fresh()->status);
        $this->assertSame(1, Task::count());
        $this->assertSame(0, Notification::count());
        $this->postJson($url.'/tasks', ['task_name' => 'No milestone', 'assigned_to' => $employee->id])->assertCreated();
    }
}
