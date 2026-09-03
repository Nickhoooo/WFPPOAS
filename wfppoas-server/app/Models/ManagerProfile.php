<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ManagerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'position',
        'department',
        'team_name',
        'office_number',
        'contact_number',
        'photo',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
