<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $docNames = [
            'Ground Floor Plan',
            'Architectural Elevations',
            'Structural Drawing',
            'Site Development Plan',
            'Electrical Layout',
            'Project Proposal',
            'Construction Documents',
            'Site Inspection Report',
            'Reflected Ceiling Plan',
            'Detail Sheet',
            'Facade Design',
            'Landscape Plan',
        ];

        $task = Task::inRandomOrder()->first() ?? Task::factory()->create();
        $uploader = User::where('role', 'employee')->inRandomOrder()->first() 
            ?? User::factory()->create(['role' => 'employee']);

        return [
            'task_id' => $task->id,
            'project_id' => $task->project_id,
            'uploaded_by' => $uploader->id,
            'file_path' => '/documents/demo/' . fake()->slug() . '/' . fake()->randomElement($docNames) . '.pdf',
            'file_type' => 'pdf',
            'version' => fake()->numberBetween(1, 3),
        ];
    }
}
