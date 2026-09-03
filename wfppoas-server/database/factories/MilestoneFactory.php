<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory
 */
class MilestoneFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $phaseNames = [
            'Project Planning',
            'Concept Design',
            'Schematic Design',
            'Design Development',
            'Construction Documents',
            'Permit & Approval',
            'Construction',
            'Project Completion',
        ];

        return [
            'project_id' => Project::factory(),
            'phase_name' => fake()->randomElement($phaseNames),
            'order' => fake()->numberBetween(1, 8),
            'status' => fake()->randomElement(['not_started', 'in_progress', 'completed']),
            'due_date' => fake()->dateTimeBetween('now', '+12 months'),
        ];
    }
}
