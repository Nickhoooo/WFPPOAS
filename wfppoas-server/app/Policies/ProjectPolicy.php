<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function manage(User $user, Project $project): bool
    {
        return $user->role === 'admin'
            || ($user->role === 'manager'
                && (int) $project->manager_id === (int) $user->id);
    }
}
