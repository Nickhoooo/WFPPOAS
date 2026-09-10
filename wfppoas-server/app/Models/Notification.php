<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

   protected $fillable = [
    'user_id',
    'project_id',
    'task_id',
    'subject_user_id',
    'message',
    'type',
    'is_read',
];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function notifyAdmins(User $actor, string $type, string $message, array $context = []): void
    {
        User::where('role', 'admin')->where('status', 'active')->where('id', '!=', $actor->id)
            ->each(function (User $admin) use ($type, $message, $context) {
                static::create(array_merge($context, [
                    'user_id' => $admin->id, 'type' => $type,
                    'message' => $message, 'is_read' => false,
                ]));
            });
    }
}
