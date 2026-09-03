<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Milestone;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
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

        $project = Project::inRandomOrder()->first() ?? Project::factory()->create();
        $milestone = Milestone::where('project_id', $project->id)->inRandomOrder()->first() 
            ?? Milestone::factory()->create(['project_id' => $project->id]);

        // Get employees only (not managers/admins)
        $assignedTo = User::where('role', 'employee')->inRandomOrder()->first();
        if (!$assignedTo) {
            $assignedTo = User::factory()->create(['role' => 'employee']);
        }

        return [
            'project_id' => $project->id,
            'milestone_id' => $milestone->id,
            'assigned_to' => $assignedTo->id,
            'task_name' => fake()->randomElement($taskNames),
            'description' => fake()->paragraph(),
            'priority' => fake()->randomElement(['low', 'medium', 'high']),
            'deadline' => fake()->dateTimeBetween('now', '+6 months'),
            'progress_percent' => fake()->numberBetween(0, 100),
            'status' => fake()->randomElement(['pending', 'in_progress', 'for_review', 'completed', 'delayed']),
            'manager_comment' => null,
        ];
    }
}
