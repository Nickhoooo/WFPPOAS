<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if notifications already exist
        if (Notification::count() > 0) {
            echo "Notifications already exist. Skipping NotificationSeeder.\n";
            return;
        }

        $users = User::all();

        $notifications = [
            'New task assigned: Prepare conceptual floor plans',
            'Task deadline approaching: Revise ground floor layout',
            'Project milestone completed: Concept Design',
            'Document uploaded to your project',
            'Task status updated to In Progress',
            'Project status changed to Ongoing',
            'Manager commented on your task',
            'Task approved and marked as completed',
            'Your performance review is ready',
            'New project assigned to team',
            'Site inspection scheduled for tomorrow',
            'Drawing revisions requested',
            'Budget update for project',
            'Team member added to project',
            'Task rejected: Please review comments',
        ];

        $types = ['task', 'document', 'project', 'performance', 'team'];

        foreach ($users as $user) {
            // Each user gets 5-10 notifications
            $numNotifications = rand(5, 10);

            for ($i = 0; $i < $numNotifications; $i++) {
                Notification::create([
                    'user_id' => $user->id,
                    'message' => fake()->randomElement($notifications),
                    'type' => fake()->randomElement($types),
                    'is_read' => fake()->boolean(70), // 70% chance of being read
                ]);
            }
        }

        echo "✓ Created notifications for all users\n";
    }
}
