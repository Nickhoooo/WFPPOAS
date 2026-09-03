<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory
 */
class EmployeeProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $specializations = [
            'Architectural Design',
            'Interior Design',
            'Structural Engineering',
            'Civil Engineering',
            'Electrical Engineering',
            'Mechanical Engineering',
            'CAD/BIM Modeling',
            'Site Engineering',
            'Quantity Surveying',
        ];

        return [
            'user_id' => User::factory()->create(['role' => 'employee'])->id,
            'prc_license_no' => 'DEMO-' . fake()->numerify('########'),
            'specialization' => fake()->randomElement($specializations),
            'years_of_experience' => fake()->numberBetween(1, 15),
            'contact_number' => '+63' . fake()->numerify('9##########'),
            'photo' => null,
        ];
    }
}
