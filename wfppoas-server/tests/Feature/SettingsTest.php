<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_each_role_can_read_own_account_and_change_password(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        foreach (['admin', 'manager', 'employee'] as $role) {
            $user = User::factory()->create(['role' => $role, 'password' => Hash::make('old-password')]);
            $token = $user->createToken('test')->plainTextToken;
            $this->withToken($token)->getJson('/api/me/account')->assertOk()->assertJsonPath('email', $user->email)->assertJsonMissingPath('password');
            $this->withToken($token)->postJson('/api/me/password', [
                'current_password' => 'old-password', 'password' => 'new-password-123', 'password_confirmation' => 'new-password-123',
            ])->assertOk();
            $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
            $this->assertSame(0, $user->tokens()->count());
            $this->assertDatabaseHas('notifications', ['user_id' => $admin->id, 'subject_user_id' => $user->id, 'type' => 'password_changed']);
            // Sanctum's resolved guard is cached within a test process.
            app('auth')->forgetGuards();
        }
    }

    public function test_invalid_password_changes_do_not_notify_or_change_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('old-password')]);
        $this->actingAs($user, 'sanctum')->postJson('/api/me/password', [
            'current_password' => 'wrong', 'password' => 'new-password-123', 'password_confirmation' => 'different',
        ])->assertUnprocessable()->assertJsonValidationErrors(['current_password', 'password']);
        $this->assertTrue(Hash::check('old-password', $user->fresh()->password));
        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_reset_notifies_admin_only_after_success_and_revokes_tokens(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $user = User::factory()->create(['role' => 'employee']);
        $user->createToken('device');
        $payload = ['email' => $user->email, 'token' => 'invalid', 'password' => 'new-password-123', 'password_confirmation' => 'new-password-123'];
        $this->postJson('/api/reset-password', $payload)->assertUnprocessable();
        $this->assertDatabaseCount('notifications', 0);
        $payload['token'] = Password::createToken($user);
        $this->postJson('/api/reset-password', $payload)->assertOk();
        $this->assertSame(0, $user->tokens()->count());
        $this->assertDatabaseHas('notifications', ['user_id' => $admin->id, 'subject_user_id' => $user->id, 'type' => 'password_reset']);
    }

    public function test_guests_cannot_access_settings_endpoints(): void
    {
        $this->getJson('/api/me/account')->assertUnauthorized();
        $this->postJson('/api/me/password')->assertUnauthorized();
    }
}
