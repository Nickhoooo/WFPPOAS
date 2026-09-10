<?php

namespace Tests\Feature;

use App\Models\AccountInvitation;
use App\Models\Notification;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminNotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_events_reach_only_active_admins_and_do_not_repeat_on_save(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        User::factory()->create(['role' => 'admin', 'status' => 'inactive']);
        $manager = User::factory()->create(['role' => 'manager']);
        $this->actingAs($manager, 'sanctum');
        $projectId = $this->postJson('/api/projects', ['project_name' => 'Notice test', 'client_name' => 'Client', 'location' => 'Manila'])->assertCreated()->json('id');
        $this->assertDatabaseHas('notifications', ['user_id' => $admin->id, 'project_id' => $projectId, 'type' => 'project_created', 'is_read' => false]);
        $this->assertSame(1, Notification::count());
        $this->putJson('/api/projects/'.$projectId, ['status' => 'completed'])->assertOk();
        $this->putJson('/api/projects/'.$projectId, ['status' => 'completed', 'description' => 'Updated'])->assertOk();
        $this->assertSame(2, Notification::count());
        $this->assertDatabaseHas('notifications', ['user_id' => $admin->id, 'project_id' => $projectId, 'type' => 'project_completed']);

        $other = User::factory()->create(['role' => 'manager']);
        $this->actingAs($other, 'sanctum');
        $this->putJson('/api/projects/'.$projectId, ['status' => 'ongoing'])->assertForbidden();
        $this->getJson('/api/notifications')->assertOk()->assertJsonCount(0);
        $id = Notification::first()->id;
        $this->putJson('/api/notifications/'.$id.'/read')->assertNotFound();
        $this->actingAs($admin, 'sanctum');
        $this->getJson('/api/notifications')->assertOk()->assertJsonCount(2);
        $this->putJson('/api/notifications/'.$id.'/read')->assertOk();
        $this->assertDatabaseHas('notifications', ['id' => $id, 'is_read' => true]);
    }

    public function test_admin_actor_is_excluded_from_project_notifications(): void
    {
        $actor = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $recipient = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $this->actingAs($actor, 'sanctum');
        $projectId = $this->postJson('/api/projects', ['project_name' => 'Admin project', 'client_name' => 'Client', 'location' => 'Manila'])->assertCreated()->json('id');
        $this->putJson('/api/projects/'.$projectId, ['status' => 'completed'])->assertOk();
        $this->assertSame(0, Notification::where('user_id', $actor->id)->count());
        $this->assertSame(2, Notification::where('user_id', $recipient->id)->count());
    }

    public function test_account_setup_notifies_admins_once_with_user_destination(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        User::factory()->create(['role' => 'admin', 'status' => 'inactive']);
        $newUser = User::factory()->create(['role' => 'admin', 'status' => 'inactive']);
        AccountInvitation::create(['user_id' => $newUser->id, 'token' => hash('sha256', 'test-invite'), 'expires_at' => now()->addDay()]);
        $payload = ['password' => 'Test-password-123', 'password_confirmation' => 'Test-password-123'];
        $this->postJson('/api/invitations/test-invite/setup', $payload)->assertOk();
        $this->assertSame(1, Notification::count());
        $this->assertDatabaseHas('notifications', ['user_id' => $admin->id, 'subject_user_id' => $newUser->id, 'type' => 'account_setup_completed']);
        $this->assertSame('active', $newUser->fresh()->status);
        $this->postJson('/api/invitations/test-invite/setup', $payload)->assertStatus(400);
        $this->assertSame(1, Notification::count());
    }
}
