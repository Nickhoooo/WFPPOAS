<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectTeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if project teams already exist (besides manager)
        if (Project::whereHas('team')->count() > 0) {
            echo "Project teams already exist. Skipping ProjectTeamSeeder.\n";
            return;
        }

        $projects = Project::all();
        $employees = User::where('role', 'employee')->get();

        foreach ($projects as $project) {
            // Manager is auto-added (Phase 3 rule)
            if (!$project->team()->where('user_id', $project->manager_id)->exists()) {
                $project->team()->attach($project->manager_id);
            }

            // Add 4-7 random employees to each project team
            $numTeamMembers = rand(4, 7);
            $selectedEmployees = $employees->random(min($numTeamMembers, $employees->count()));

            foreach ($selectedEmployees as $employee) {
                // Avoid duplicate entries
                if (!$project->team()->where('user_id', $employee->id)->exists()) {
                    $project->team()->attach($employee->id);
                }
            }
        }

        echo "✓ Created project teams with employees\n";
    }
}
