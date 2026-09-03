<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create demo data for WFPPOAS testing
        echo "\n========================================\n";
        echo "Seeding WFPPOAS Demo Data\n";
        echo "========================================\n\n";

        $this->call([
            UserSeeder::class,
            ProjectSeeder::class,
            MilestoneSeeder::class,
            ProjectTeamSeeder::class,  // Add employees to project teams (Phase 3 requirement)
            TaskSeeder::class,
            DocumentSeeder::class,
            PerformanceSeeder::class,
            NotificationSeeder::class,
        ]);

        echo "\n========================================\n";
        echo "✓ Demo Data Seeding Complete!\n";
        echo "========================================\n\n";
        echo "Demo Users:\n";
        echo "  Admin: admin@wfppoas.com / admin123\n";
        echo "  Managers: carlos.mendoza@demo-wfppoas.com / password123\n";
        echo "           maria.santos@demo-wfppoas.com / password123\n";
        echo "           daniel.reyes@demo-wfppoas.com / password123\n";
        echo "  Employees: use their demo-wfppoas emails with password123\n\n";
    }
}
