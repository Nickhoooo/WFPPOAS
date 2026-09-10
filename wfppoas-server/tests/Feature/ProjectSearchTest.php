<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Tests\TestCase;

class ProjectSearchTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        app('db')->purge('sqlite');
        $this->artisan('migrate', ['--force' => true])->assertExitCode(0);
    }

    public function test_search_requires_login_and_limits_employee_results_to_memberships(): void
    {
        $owner = User::factory()->create(['role' => 'manager']);
        $employee = User::factory()->create(['role' => 'employee']);
        $own = Project::create(['project_name' => 'Office Alpha', 'client_name' => 'Client', 'location' => 'Manila', 'manager_id' => $owner->id]);
        $other = Project::create(['project_name' => 'Office Beta', 'client_name' => 'Client', 'location' => 'Manila', 'manager_id' => $owner->id]);
        $own->team()->attach($employee->id);
        $this->getJson('/api/project-search?q=office')->assertUnauthorized();
        $this->actingAs($employee, 'sanctum')->getJson('/api/project-search?q=OFFICE')
            ->assertOk()->assertJsonCount(1)->assertJsonPath('0.id', $own->id)->assertJsonMissing(['id' => $other->id]);
        foreach (['admin', 'manager'] as $role) {
            $this->actingAs(User::factory()->create(['role' => $role]), 'sanctum')
                ->getJson('/api/project-search?q=office')->assertOk()->assertJsonCount(2);
        }
    }

    public function test_search_is_bounded_validated_and_treats_wildcards_literally(): void
    {
        $owner = User::factory()->create(['role' => 'manager']);
        for ($i = 0; $i < 10; $i++) {
            Project::create(['project_name' => 'Office '.$i, 'client_name' => 'Client', 'location' => 'Manila', 'manager_id' => $owner->id]);
        }
        Project::create(['project_name' => 'Office 50%_done', 'client_name' => 'Client', 'location' => 'Manila', 'manager_id' => $owner->id]);
        $this->actingAs($owner, 'sanctum');
        $this->getJson('/api/project-search?q=office')->assertOk()->assertJsonCount(8)
            ->assertJsonStructure([['id', 'project_name', 'status']]);
        $this->getJson('/api/project-search?q=%25_')->assertOk()->assertJsonCount(1);
        $this->getJson('/api/project-search?q=o')->assertOk()->assertExactJson([]);
        $this->getJson('/api/project-search?q=missing')->assertOk()->assertExactJson([]);
        $this->getJson('/api/project-search?q='.str_repeat('a', 101))->assertUnprocessable();
    }
}
