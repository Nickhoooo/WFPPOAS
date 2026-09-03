<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_name',
        'client_name',
        'description',
        'budget',
        'start_date',
        'end_date',
        'status',
        'manager_id',
    ];

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }


    public function milestones()
    {
        return $this->hasMany(Milestone::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function team()
    {
        return $this->belongsToMany(User::class, 'project_team')->withTimestamps();
    }
}
