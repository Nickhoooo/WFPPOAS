<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\EmployeeProfile;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Always ensure a real admin exists for login recovery.
        $admin = User::firstOrCreate(
            ['email' => 'admin@wfppoas.com'],
            [
                'name' => 'System Administrator',
                'role' => 'admin',
                'status' => 'active',
                'password' => bcrypt('admin123'),
            ]
        );

        if ($admin->wasRecentlyCreated) {
            \App\Models\AdminProfile::firstOrCreate(
                ['user_id' => $admin->id],
                [
                    'position' => 'System Administrator',
                    'department' => 'Administration',
                    'office_number' => '101',
                ]
            );
            echo "✓ Created default admin account\n";
        }

        // If demo users already exist, do not re-create them.
        if (User::where('email', 'like', '%demo-wfppoas%')->exists()) {
            echo "Demo users already exist. Skipping demo user creation.\n";
            return;
        }

        // Create 3 Managers
        $managers = [
            [
                'name' => 'Carlos Mendoza',
                'email' => 'carlos.mendoza@demo-wfppoas.com',
                'role' => 'manager',
            ],
            [
                'name' => 'Maria Santos',
                'email' => 'maria.santos@demo-wfppoas.com',
                'role' => 'manager',
            ],
            [
                'name' => 'Daniel Reyes',
                'email' => 'daniel.reyes@demo-wfppoas.com',
                'role' => 'manager',
            ],
        ];

        foreach ($managers as $manager) {
            User::factory()->create([
                'name' => $manager['name'],
                'email' => $manager['email'],
                'role' => $manager['role'],
                'status' => 'active',
                'password' => bcrypt('password123'),
            ]);
        }

        echo "✓ Created 3 managers\n";

        // Create 12 Employees with profiles
        $employees = [
            // Architects
            ['name' => 'Juan Dela Cruz', 'specialization' => 'Architectural Design', 'experience' => 5],
            ['name' => 'Ana Garcia', 'specialization' => 'Interior Design', 'experience' => 3],
            ['name' => 'Miguel Torres', 'specialization' => 'Architectural Design', 'experience' => 7],
            
            // Engineers
            ['name' => 'Maria Hernandez', 'specialization' => 'Structural Engineering', 'experience' => 6],
            ['name' => 'Roberto Flores', 'specialization' => 'Civil Engineering', 'experience' => 8],
            ['name' => 'Carmen Rosales', 'specialization' => 'Electrical Engineering', 'experience' => 4],
            
            // CAD/BIM
            ['name' => 'Diego Sanchez', 'specialization' => 'CAD/BIM Modeling', 'experience' => 3],
            ['name' => 'Isabella Martinez', 'specialization' => 'CAD/BIM Modeling', 'experience' => 5],
            
            // Site & Other
            ['name' => 'Lucas Gomez', 'specialization' => 'Site Engineering', 'experience' => 2],
            ['name' => 'Sofia Romero', 'specialization' => 'Quantity Surveying', 'experience' => 4],
            ['name' => 'Fernando Diaz', 'specialization' => 'Structural Engineering', 'experience' => 9],
            ['name' => 'Elena Vargas', 'specialization' => 'Civil Engineering', 'experience' => 6],
        ];

        foreach ($employees as $index => $emp) {
            $user = User::factory()->create([
                'name' => $emp['name'],
                'email' => strtolower(str_replace(' ', '.', $emp['name'])) . '@demo-wfppoas.com',
                'role' => 'employee',
                'status' => 'active',
                'password' => bcrypt('password123'),
            ]);

            // Create employee profile
            EmployeeProfile::factory()->create([
                'user_id' => $user->id,
                'specialization' => $emp['specialization'],
                'years_of_experience' => $emp['experience'],
            ]);
        }

        echo "✓ Created 12 employees with profiles\n";
    }
}
