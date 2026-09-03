<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSelfProtectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_change_their_own_role(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->putJson('/api/users/' . $admin->id, [
            'role' => 'employee',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'You cannot change your own account while logged in.');
    }

    public function test_admin_cannot_delete_their_own_account(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin2@example.com',
            'role' => 'admin',
        ]);

        $this->actingAs($admin, 'sanctum');

        $response = $this->deleteJson('/api/users/' . $admin->id);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'You cannot delete your own account while logged in.');
    }
}
