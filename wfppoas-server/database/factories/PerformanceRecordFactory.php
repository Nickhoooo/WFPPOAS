<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory
 */
class PerformanceRecordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $employee = User::where('role', 'employee')->inRandomOrder()->first() 
            ?? User::factory()->create(['role' => 'employee']);
        
        $manager = User::where('role', 'manager')->inRandomOrder()->first() 
            ?? User::factory()->manager()->create();

        $project = Project::inRandomOrder()->first() ?? Project::factory()->create();

        return [
            'user_id' => $employee->id,
            'project_id' => $project->id,
            'completion_rate' => fake()->numberBetween(75, 100),
            'revision_count' => fake()->numberBetween(0, 5),
            'on_time_rate' => fake()->numberBetween(80, 100),
            'evaluated_by' => $manager->id,
            'period' => fake()->randomElement(['2026-Q3', '2026-Q2', '2026-Q1']),
        ];
    }
}
