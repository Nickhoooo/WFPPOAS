<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;

class AuthorizeProfile
{
    public function handle(Request $request, Closure $next)
    {
        $target = User::findOrFail($request->route('userId'));
        abort_unless($request->user()->role === 'admin' || (int) $request->user()->id === (int) $target->id, 403);
        abort_unless(str_ends_with($request->path(), $target->role.'-profile'), 404);
        return $next($request);
    }
}
