<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MigrationHistoryTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        app('db')->purge('sqlite');
    }

    public function test_full_history_can_migrate_rollback_and_migrate_again(): void
    {
        $this->artisan('migrate', ['--force' => true])->assertExitCode(0);
        $this->assertTrue(Schema::hasColumns('notifications', ['id', 'user_id', 'message', 'type', 'is_read', 'project_id', 'task_id']));
        $this->assertTrue(Schema::hasColumns('tasks', ['employee_comment', 'completed_at']));
        $this->assertTrue(Schema::hasColumn('projects', 'location'));
        $this->assertSame(count(glob(database_path('migrations/*.php'))), DB::table('migrations')->count());

        $this->artisan('migrate', ['--force' => true])->assertExitCode(0);
        // Reverse one migration at a time to exercise the duplicate marker's down().
        while (DB::table('migrations')->exists()) {
            $this->artisan('migrate:rollback', ['--step' => 1, '--force' => true])->assertExitCode(0);
            if (DB::table('migrations')->where('migration', '2026_09_07_055527_add_employee_comment_to_tasks_table')->exists()) {
                $this->assertTrue(Schema::hasColumn('tasks', 'employee_comment'));
            }
        }
        $this->assertFalse(Schema::hasTable('notifications'));
        $this->assertFalse(Schema::hasTable('users'));
        $this->artisan('migrate', ['--force' => true])->assertExitCode(0);
        $this->assertTrue(Schema::hasColumn('tasks', 'employee_comment'));
    }
}
