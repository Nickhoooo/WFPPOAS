<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if documents already exist
        if (Document::count() > 0) {
            echo "Documents already exist. Skipping DocumentSeeder.\n";
            return;
        }

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

        $tasks = Task::all();
        $employees = User::where('role', 'employee')->get();

        foreach ($tasks as $task) {
            // Each task gets 1-3 documents
            $numDocs = rand(1, 3);

            for ($i = 0; $i < $numDocs; $i++) {
                $docName = fake()->randomElement($docNames);
                
                $slug = strtolower(preg_replace('/[^A-Za-z0-9]+/', '-', $docName));
                $slug = trim($slug, '-');

                Document::create([
                    'task_id' => $task->id,
                    'project_id' => $task->project_id,
                    'uploaded_by' => $employees->random()->id,
                    'file_path' => '/documents/demo/' . $task->project_id . '/' . $slug . '-v' . ($i + 1) . '.pdf',
                    'file_type' => 'pdf',
                    'version' => $i + 1,
                ]);
            }
        }

        echo "✓ Created documents for tasks\n";
    }
}
