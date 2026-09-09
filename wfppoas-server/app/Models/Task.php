<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
    'project_id',
    'milestone_id',
    'assigned_to',
    'task_name',
    'description',
    'priority',
    'deadline',
    'completed_at',
    'progress_percent',
    'status',
    'manager_comment',
    'employee_comment',
];

 protected $casts = [
        'deadline' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function milestone()
    {
        return $this->belongsTo(Milestone::class);
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}