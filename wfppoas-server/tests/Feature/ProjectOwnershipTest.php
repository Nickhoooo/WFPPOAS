<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ProjectOwnershipTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Always isolate these tests from the application database.
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        app('db')->purge('sqlite');

        $this->artisan('migrate', ['--force' => true])->assertExitCode(0);
    }

    public static function actors(): array
    {
        return [
            'owning manager' => ['owner', true],
            'admin' => ['admin', true],
            'other manager on team' => ['manager', false],
            'employee on team' => ['employee', false],
            'guest' => ['guest', false],
        ];
    }

    #[DataProvider('actors')]
    public function test_project_and_team_mutations_require_management_authority(string $actor, bool $allowed): void
    {
        $owner = User::factory()->create(['role' => 'manager']);
        $member = User::factory()->create(['role' => 'employee']);
        $newMember = User::factory()->create(['role' => 'employee']);
        $project = Project::create([
            'project_name' => 'Original', 'client_name' => 'Client',
            'location' => 'Manila', 'manager_id' => $owner->id,
        ]);
        $project->team()->attach([$owner->id, $member->id]);

        if ($actor !== 'guest') {
            $user = $actor === 'owner' ? $owner : User::factory()->create(['role' => $actor]);
            $project->team()->syncWithoutDetaching([$user->id]);
            $this->actingAs($user, 'sanctum');
        }

        $url = '/api/projects/'.$project->id;
        $denied = $actor === 'guest' ? 401 : 403;
        $this->putJson($url, ['project_name' => 'Changed'])->assertStatus($allowed ? 200 : $denied);
        $this->assertSame($allowed ? 'Changed' : 'Original', $project->fresh()->project_name);

        $this->postJson($url.'/team', ['user_id' => $newMember->id])->assertStatus($allowed ? 201 : $denied);
        $this->assertSame($allowed, $project->team()->where('users.id', $newMember->id)->exists());

        $this->deleteJson($url.'/team/'.$member->id)->assertStatus($allowed ? 200 : $denied);
        $this->assertSame(!$allowed, $project->team()->where('users.id', $member->id)->exists());

        // Even admins must preserve the existing manager-removal safeguard.
        $this->deleteJson($url.'/team/'.$owner->id)->assertStatus($allowed ? 422 : $denied);
        $this->assertTrue($project->team()->where('users.id', $owner->id)->exists());

        $this->deleteJson($url)->assertStatus($allowed ? 200 : $denied);
        $this->assertSame(!$allowed, Project::whereKey($project->id)->exists());
    }

    public function test_creation_and_other_manager_read_access_are_preserved(): void
    {
        $owner = User::factory()->create(['role' => 'manager']);
        $this->actingAs($owner, 'sanctum');
        $this->postJson('/api/projects', [
            'project_name' => 'New project', 'client_name' => 'Client', 'location' => 'Manila',
        ])->assertCreated();
        $project = Project::firstOrFail();
        $this->assertEquals($owner->id, $project->manager_id);
        $this->assertTrue($project->team()->where('users.id', $owner->id)->exists());

        $this->actingAs(User::factory()->create(['role' => 'manager']), 'sanctum');
        $this->getJson('/api/projects')->assertOk();
        $this->getJson('/api/projects/'.$project->id.'/team')->assertOk();
        $this->putJson('/api/projects/'.$project->id, [])->assertForbidden();
        $this->postJson('/api/projects/'.$project->id.'/team', [])->assertForbidden();
    }
}
