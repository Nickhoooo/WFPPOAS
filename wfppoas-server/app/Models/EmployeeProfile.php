<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'prc_license_no',
        'specialization',
        'years_of_experience',
        'contact_number',
        'photo',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
