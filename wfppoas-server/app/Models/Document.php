<?php

namespace App\Models;

use illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'project_id',
        'uploaded_by',
        'file_path',
        'file_type',
        'version',
    ];

    public function task(){
        return $this->belongsTo(Task::class);
    }

    public function project(){
        return $this->belongsTo(Project::class);
    }
    public function uploader(){
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
