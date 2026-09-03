<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-6 months', 'now');
        $endDate = fake()->dateTimeBetween($startDate, '+12 months');

        return [
            'project_name' => fake()->catchPhrase(),
            'client_name' => fake()->company(),
            'description' => fake()->paragraph(),
            'budget' => fake()->numberBetween(5000000, 50000000),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => fake()->randomElement(['ongoing', 'on-hold', 'completed']),
            'manager_id' => User::where('role', 'manager')->inRandomOrder()->first()->id ?? User::factory()->manager(),
        ];
    }
}
