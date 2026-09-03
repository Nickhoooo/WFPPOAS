<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase3BackendRulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_is_added_to_project_team_when_project_is_created(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);

        $this->actingAs($manager, 'sanctum');

        $response = $this->postJson('/api/projects', [
            'project_name' => 'Project Alpha',
            'client_name' => 'Client A',
            'status' => 'ongoing',
        ]);

        $response->assertStatus(201);

        $project = Project::first();

        $this->assertTrue($project->team()->where('user_id', $manager->id)->exists());
    }

    public function test_duplicate_project_team_member_is_rejected(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $employee = User::factory()->create(['role' => 'employee']);

        $project = Project::create([
            'project_name' => 'Project Beta',
            'client_name' => 'Client Beta',
            'status' => 'ongoing',
            'manager_id' => $manager->id,
        ]);

        $project->team()->attach($employee->id);

        $this->actingAs($manager, 'sanctum');

        $response = $this->postJson('/api/projects/' . $project->id . '/team', [
            'user_id' => $employee->id,
        ]);

        $response->assertStatus(409);
    }

    public function test_task_assignment_requires_project_team_membership(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $employee = User::factory()->create(['role' => 'employee']);
        $outsider = User::factory()->create(['role' => 'employee']);

        $project = Project::create([
            'project_name' => 'Project Gamma',
            'client_name' => 'Client Gamma',
            'status' => 'ongoing',
            'manager_id' => $manager->id,
        ]);

        $project->team()->attach($employee->id);

        $this->actingAs($manager, 'sanctum');

        $response = $this->postJson('/api/projects/' . $project->id . '/tasks', [
            'assigned_to' => $outsider->id,
            'task_name' => 'Task with outsider',
            'priority' => 'high',
            'deadline' => now()->addDay()->toDateString(),
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Kailangan munang idagdag ang taong ito sa team ng project bago siya bigyan ng task.');
    }

    public function test_task_assignment_update_requires_project_team_membership(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $member = User::factory()->create(['role' => 'employee']);
        $outsider = User::factory()->create(['role' => 'employee']);

        $project = Project::create([
            'project_name' => 'Project Delta',
            'client_name' => 'Client Delta',
            'status' => 'ongoing',
            'manager_id' => $manager->id,
        ]);

        $project->team()->attach($member->id);

        $task = Task::create([
            'project_id' => $project->id,
            'assigned_to' => $member->id,
            'task_name' => 'Existing task',
            'status' => 'pending',
            'progress_percent' => 0,
        ]);

        $this->actingAs($manager, 'sanctum');

        $response = $this->putJson('/api/projects/' . $project->id . '/tasks/' . $task->id, [
            'assigned_to' => $outsider->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Kailangan munang idagdag ang taong ito sa team ng project bago siya bigyan ng task.');
    }

    public function test_performance_snapshot_is_computed_from_completed_tasks(): void
    {
        $manager = User::factory()->create(['role' => 'manager']);
        $employee = User::factory()->create(['role' => 'employee']);

        $project = Project::create([
            'project_name' => 'Project Epsilon',
            'client_name' => 'Client Epsilon',
            'status' => 'ongoing',
            'manager_id' => $manager->id,
        ]);

        $project->team()->attach($employee->id);

        Task::create([
            'project_id' => $project->id,
            'assigned_to' => $employee->id,
            'task_name' => 'Done task',
            'status' => 'completed',
            'progress_percent' => 100,
            'deadline' => now()->subDay()->toDateString(),
            'updated_at' => now(),
        ]);

        Task::create([
            'project_id' => $project->id,
            'assigned_to' => $employee->id,
            'task_name' => 'Another done task',
            'status' => 'completed',
            'progress_percent' => 100,
            'deadline' => now()->addDay()->toDateString(),
            'updated_at' => now(),
        ]);

        $this->actingAs($manager, 'sanctum');

        $response = $this->postJson('/api/users/' . $employee->id . '/performance/compute', [
            'project_id' => $project->id,
            'period' => '2026-Q1',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('completion_rate', 100)
            ->assertJsonPath('on_time_rate', 50);
    }
}
