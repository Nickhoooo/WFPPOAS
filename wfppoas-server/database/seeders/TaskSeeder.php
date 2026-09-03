<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Milestone;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if tasks already exist
        if (Task::count() > 0) {
            echo "Tasks already exist. Skipping TaskSeeder.\n";
            return;
        }

        $taskNames = [
            'Prepare conceptual floor plans',
            'Revise ground floor layout',
            'Develop facade design',
            'Prepare reflected ceiling plan',
            'Update architectural elevations',
            'Prepare construction drawings',
            'Structural analysis',
            'Prepare column layout',
            'Review beam design',
            'Update structural drawings',
            'Site development plan',
            'Drainage layout',
            'Grading plan',
            'Lighting layout',
            'Power distribution plan',
            'Prepare permit drawings',
            'Update drawing revisions',
            'Compile construction documents',
            'Site inspection',
            'Quality assurance review',
        ];

        $statuses = ['pending', 'in_progress', 'for_review', 'completed'];
        $priorities = ['low', 'medium', 'high'];

        $employees = User::where('role', 'employee')->get();
        $milestones = Milestone::all();

        foreach ($milestones as $milestone) {
            // Each milestone gets 3-5 tasks
            $numTasks = rand(3, 5);

            for ($i = 0; $i < $numTasks; $i++) {
                $employee = $employees->random();

                $dueDate = $milestone->due_date 
                    ? \Carbon\Carbon::parse($milestone->due_date)->subDays(rand(5, 15))
                    : now()->addDays(rand(10, 30));

                Task::create([
                    'project_id' => $milestone->project_id,
                    'milestone_id' => $milestone->id,
                    'assigned_to' => $employee->id,
                    'task_name' => fake()->randomElement($taskNames),
                    'description' => fake()->paragraph(),
                    'priority' => fake()->randomElement($priorities),
                    'deadline' => $dueDate,
                    'progress_percent' => fake()->numberBetween(0, 100),
                    'status' => fake()->randomElement($statuses),
                    'manager_comment' => null,
                ]);
            }
        }

        echo "✓ Created tasks for all milestones\n";
    }
}
