<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class MyProfileTest extends TestCase
{
    use RefreshDatabase;

    private function png()
    {
        return UploadedFile::fake()->createWithContent('avatar.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aU1sAAAAASUVORK5CYII='));
    }

    public static function roles(): array { return [['admin'], ['manager'], ['employee']]; }

    #[DataProvider('roles')]
    public function test_profile_upload_replacement_and_clearing_fields(string $role): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['role' => $role]);
        $this->actingAs($user, 'sanctum');
        $this->getJson('/api/me/profile')->assertOk();
        $response = $this->postJson('/api/me/profile', ['contact_number' => '123', 'photo' => $this->png()])->assertOk();
        $path = $response->json('photo');
        Storage::disk('local')->assertExists($path);
        $this->getJson('/api/me/profile/photo')->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->postJson('/api/me/profile', ['contact_number' => null])->assertOk()->assertJsonPath('contact_number', null)->assertJsonPath('photo', $path);
        $this->postJson('/api/me/profile', ['photo' => UploadedFile::fake()->create('bad.svg', 10, 'image/svg+xml')])->assertUnprocessable();
        $this->postJson('/api/me/profile', ['photo' => $this->png()->size(2049)])->assertUnprocessable();
        Storage::disk('local')->assertExists($path);
        $this->postJson('/api/me/profile', ['photo' => $this->png()])->assertOk();
        Storage::disk('local')->assertMissing($path);
    }

    public function test_other_profiles_are_protected_and_guest_is_denied(): void
    {
        $this->getJson('/api/me/profile')->assertUnauthorized();
        $this->getJson('/api/me/profile/photo')->assertUnauthorized();
        $employee = User::factory()->create(['role' => 'employee']);
        $other = User::factory()->create(['role' => 'employee']);
        $this->actingAs($employee, 'sanctum');
        $this->postJson('/api/me/profile', ['user_id' => $other->id, 'contact_number' => '123'])->assertOk()->assertJsonPath('user_id', $employee->id);
        $url = '/api/users/'.$other->id.'/employee-profile';
        $this->getJson($url)->assertForbidden();
        $this->postJson($url, ['contact_number' => '456'])->assertForbidden();
        $this->putJson($url, ['contact_number' => '456'])->assertForbidden();
        $this->getJson('/api/users/'.$employee->id.'/admin-profile')->assertNotFound();
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->getJson('/api/users/'.$employee->id.'/employee-profile')->assertOk();
    }

    public function test_only_admin_can_retrieve_another_users_private_avatar(): void
    {
        Storage::fake('local');
        $employee = User::factory()->create(['role' => 'employee']);
        $this->actingAs($employee, 'sanctum');
        $this->postJson('/api/me/profile', ['photo' => $this->png()])->assertOk();
        $url = '/api/users/'.$employee->id.'/photo';
        $this->getJson($url)->assertForbidden();
        $this->actingAs(User::factory()->create(['role' => 'manager']), 'sanctum');
        $this->getJson($url)->assertForbidden();
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->getJson($url)->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->getJson('/api/users/'.$employee->id)->assertOk()->assertJsonPath('employee_profile.user_id', $employee->id);
    }
}

