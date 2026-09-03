<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\PerformanceRecord;
use Illuminate\Database\Seeder;

class PerformanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if performance records already exist
        if (PerformanceRecord::where('period', 'like', '2026%')->exists()) {
            echo "Performance records already exist. Skipping PerformanceSeeder.\n";
            return;
        }

        $employees = User::where('role', 'employee')->get();
        $managers = User::where('role', 'manager')->get();
        $projects = Project::all();
        $periods = ['2026-Q1', '2026-Q2', '2026-Q3'];

        foreach ($employees as $employee) {
            // Each employee gets 2-3 performance records
            $numRecords = rand(2, 3);
            $selectedProjects = $projects->random(min($numRecords, $projects->count()));

            foreach ($selectedProjects as $project) {
                $period = fake()->randomElement($periods);

                PerformanceRecord::create([
                    'user_id' => $employee->id,
                    'project_id' => $project->id,
                    'completion_rate' => fake()->numberBetween(75, 98),
                    'revision_count' => fake()->numberBetween(0, 5),
                    'on_time_rate' => fake()->numberBetween(80, 100),
                    'evaluated_by' => $managers->random()->id,
                    'period' => $period,
                ]);
            }
        }

        echo "✓ Created performance records for all employees\n";
    }
}
