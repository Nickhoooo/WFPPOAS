<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if demo projects already exist
        if (Project::where('project_name', 'like', '%Tower%')->orWhere('project_name', 'like', '%Residence%')->exists()) {
            echo "Demo projects already exist. Skipping ProjectSeeder.\n";
            return;
        }

        $managers = User::where('role', 'manager')->get();

        $projects = [
            [
                'name' => 'Greenfield Commercial Tower',
                'client' => 'Greenfield Development Corp',
                'budget' => 25000000,
                'description' => 'A modern 15-story commercial office tower with retail spaces',
                'status' => 'ongoing',
                'manager' => $managers->get(0),
            ],
            [
                'name' => 'Rivera Residence',
                'client' => 'Rivera Family',
                'budget' => 5000000,
                'description' => 'Luxury 4-bedroom residential house with modern design',
                'status' => 'ongoing',
                'manager' => $managers->get(1),
            ],
            [
                'name' => 'City Hall Renovation',
                'client' => 'City Government',
                'budget' => 15000000,
                'description' => 'Complete renovation of historic city hall building',
                'status' => 'on-hold',
                'manager' => $managers->get(2),
            ],
            [
                'name' => 'Northgate Office Complex',
                'client' => 'Northgate Properties',
                'budget' => 35000000,
                'description' => '3 office buildings with parking facility and amenities',
                'status' => 'ongoing',
                'manager' => $managers->get(0),
            ],
            [
                'name' => 'St. Gabriel School Expansion',
                'client' => 'St. Gabriel Educational Foundation',
                'budget' => 8000000,
                'description' => 'Addition of 6 new classrooms and library wing',
                'status' => 'ongoing',
                'manager' => $managers->get(1),
            ],
            [
                'name' => 'Riverside Mixed-Use Development',
                'client' => 'Riverside Development LLC',
                'budget' => 45000000,
                'description' => 'Mixed-use complex with residential, commercial, and retail spaces',
                'status' => 'completed',
                'manager' => $managers->get(2),
            ],
            [
                'name' => 'Metro Station Modernization',
                'client' => 'Metro Transit Authority',
                'budget' => 50000000,
                'description' => 'Upgrade and expansion of central metro station',
                'status' => 'ongoing',
                'manager' => $managers->get(0),
            ],
            [
                'name' => 'Sunset Garden Residences',
                'client' => 'Sunset Properties',
                'budget' => 12000000,
                'description' => 'Gated residential community with 45 units',
                'status' => 'ongoing',
                'manager' => $managers->get(1),
            ],
        ];

        foreach ($projects as $projectData) {
            $startDate = \Carbon\Carbon::now()->subMonths(rand(3, 6));
            $endDate = $startDate->copy()->addMonths(rand(6, 12));

            Project::create([
                'project_name' => $projectData['name'],
                'client_name' => $projectData['client'],
                'description' => $projectData['description'],
                'budget' => $projectData['budget'],
                'status' => $projectData['status'],
                'manager_id' => $projectData['manager']->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]);
        }

        echo "✓ Created 8 projects\n";
    }
}
