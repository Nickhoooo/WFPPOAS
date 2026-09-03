<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_request_a_password_reset_link(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'resetme@example.com',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Password reset link has been sent to your email address.');

        Notification::assertSentTo(
            new AnonymousNotifiable(),
            ResetPassword::class,
            function ($notification, $channels) use ($user) {
                $this->assertSame($user->email, $notification->toMail($user)->to[0]['address']);
                return true;
            }
        );
    }

    public function test_user_can_reset_their_password_with_a_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'resetuser@example.com',
            'password' => Hash::make('old-password'),
        ]);

        $token = app('auth.password.broker')->createToken($user);

        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Your password has been reset successfully.');

        $user->refresh();

        $this->assertTrue(Hash::check('new-password-123', $user->password));
    }
}
