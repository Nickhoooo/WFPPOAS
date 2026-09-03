<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerformanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'project_id',
        'completion_rate',
        'revision_count',
        'on_time_rate',
        'evaluated_by',
        'period',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluated_by');
    }
}