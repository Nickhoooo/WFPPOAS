<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class DocumentAuthorizationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        app('db')->purge('sqlite');
        foreach ([
            '0001_01_01_000000_create_users_table.php',
            '2026_08_21_092313_create_projects_table.php',
            '2026_08_21_093551_create_milestones_table.php',
            '2026_08_21_094949_create_tasks_table.php',
            '2026_08_21_100743_create_documents_table.php',
            '2026_08_31_025141_create_project_team_table.php',
        ] as $migration) {
            (require database_path('migrations/'.$migration))->up();
        }
        Storage::fake('local');
        Storage::fake('public');
    }

    public static function actors(): array
    {
        return [
            ['owner', true, true], ['admin', true, true],
            ['employee', true, false], ['uploader', true, false],
            ['manager', false, false], ['outsider', false, false],
            ['removed', false, false], ['guest', false, false],
        ];
    }

    #[DataProvider('actors')]
    public function test_document_access_and_deletion_permissions(string $actor, bool $access, bool $delete): void
    {
        $owner = User::factory()->create(['role' => 'manager']);
        $uploader = User::factory()->create(['role' => 'employee']);
        $project = Project::create(['project_name' => 'A', 'client_name' => 'Client', 'manager_id' => $owner->id]);
        $project->team()->attach($uploader->id);
        $document = Document::create([
            'project_id' => $project->id, 'uploaded_by' => $uploader->id,
            'file_path' => 'documents/proof.txt', 'file_type' => 'drawing', 'version' => 1,
        ]);
        Storage::disk('local')->put($document->file_path, 'Private proof');
        if ($actor !== 'guest') {
            $user = match ($actor) {
                'owner' => $owner,
                'uploader', 'removed' => $uploader,
                default => User::factory()->create(['role' => in_array($actor, ['admin', 'manager']) ? $actor : 'employee']),
            };
            if (in_array($actor, ['employee', 'manager'])) {
                $project->team()->attach($user->id);
            }
            if ($actor === 'removed') {
                $project->team()->detach($user->id);
            }
            $this->actingAs($user, 'sanctum');
        }
        $denied = $actor === 'guest' ? 401 : 403;
        $url = '/api/projects/'.$project->id.'/documents';
        $this->getJson($url)->assertStatus($access ? 200 : $denied);
        $response = $this->getJson('/api/documents/'.$document->id.'/download')->assertStatus($access ? 200 : $denied);
        if ($access) {
            $response->assertDownload('proof.txt');
            $this->assertSame('Private proof', $response->streamedContent());
            $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        }
        $upload = $this->postJson($url, [
            'file' => UploadedFile::fake()->create('new.pdf', 10, 'application/pdf'),
            'file_type' => 'drawing',
        ])->assertStatus($access ? 201 : $denied);
        if ($access) {
            Storage::disk('local')->assertExists($upload->json('file_path'));
            Storage::disk('public')->assertMissing($upload->json('file_path'));
        }
        $this->assertSame($access ? 2 : 1, Document::count());
        $this->deleteJson('/api/documents/'.$document->id)->assertStatus($delete ? 200 : $denied);
        $this->assertSame(!$delete, Document::whereKey($document->id)->exists());
        $this->assertSame(!$delete, Storage::disk('local')->exists($document->file_path));
    }

    public function test_missing_file_returns_404_after_authorization(): void
    {
        $owner = User::factory()->create(['role' => 'manager']);
        $project = Project::create(['project_name' => 'A', 'client_name' => 'Client', 'manager_id' => $owner->id]);
        $document = Document::create(['project_id' => $project->id, 'uploaded_by' => $owner->id, 'file_path' => 'documents/missing.txt']);
        $this->actingAs($owner, 'sanctum');
        $this->getJson('/api/documents/'.$document->id.'/download')->assertNotFound();
    }
}
