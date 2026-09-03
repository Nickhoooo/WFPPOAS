<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Milestone;
use Illuminate\Database\Seeder;

class MilestoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if milestones already exist
        if (Milestone::count() > 0) {
            echo "Milestones already exist. Skipping MilestoneSeeder.\n";
            return;
        }

        $milestonePhases = [
            'Project Planning',
            'Concept Design',
            'Schematic Design',
            'Design Development',
            'Construction Documents',
            'Permit & Approval',
            'Construction',
            'Project Completion',
        ];

        $projects = Project::all();

        foreach ($projects as $project) {
            // Each project gets 5-7 milestones
            $numMilestones = rand(5, 7);
            $selectedPhases = array_slice($milestonePhases, 0, $numMilestones);

            $projectStartDate = \Carbon\Carbon::parse($project->start_date ?? now());
            $projectEndDate = \Carbon\Carbon::parse($project->end_date ?? now()->addMonths(12));
            $totalDays = $projectStartDate->diffInDays($projectEndDate);
            $daysPerMilestone = $totalDays / $numMilestones;

            foreach ($selectedPhases as $order => $phaseName) {
                $milestoneDate = $projectStartDate->copy()->addDays($daysPerMilestone * ($order + 1));

                Milestone::create([
                    'project_id' => $project->id,
                    'phase_name' => $phaseName,
                    'order' => $order + 1,
                    'status' => $order < 2 ? 'completed' : ($order < 4 ? 'in_progress' : 'not_started'),
                    'due_date' => $milestoneDate,
                ]);
            }
        }

        echo "✓ Created milestones for all projects\n";
    }
}
