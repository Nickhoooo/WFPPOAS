<?php

namespace App\Http\Controllers;

use App\Mail\UserInvitationMail;
use App\Models\AccountInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UserController extends Controller
{
    protected function attachProfileMeta($user)
    {
        $profile = match ($user->role) {
            'admin' => $user->adminProfile,
            'manager' => $user->managerProfile,
            'employee' => $user->employeeProfile,
            default => null,
        };

        $user->department = $profile?->department ?? null;
        $user->position = $profile?->position ?? null;
        $user->team_name = $profile?->team_name ?? null;
        $user->office_number = $profile?->office_number ?? null;
        $user->contact_number = $profile?->contact_number ?? null;

        return $user;
    }

    public function index()
    {
        $users = User::with(['adminProfile', 'managerProfile', 'employeeProfile'])->get();

        return response()->json(
            $users->map(function ($user) {
                return $this->attachProfileMeta($user);
            })
        );
    }

    public function invite(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|in:admin,manager,employee',
        ]);

        $plainToken = Str::random(64);

        $user = DB::transaction(function () use ($validated, $plainToken) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make(Str::random(64)),
                'role' => $validated['role'],
                'status' => 'inactive',
            ]);

            AccountInvitation::create([
                'user_id' => $user->id,
                'token' => hash('sha256', $plainToken),
                'expires_at' => now()->addHours(48),
            ]);

            return $user;
        });

        $setupUrl = rtrim(env('CLIENT_URL', 'http://localhost:5173'), '/')
            . '/account-setup?token=' . urlencode($plainToken);

        Mail::to($user->email)->send(new UserInvitationMail($user, $setupUrl));

        return response()->json([
            'message' => 'Invitation created and sent successfully.',
            'user' => $user,
        ], 201);
    }

    public function show($id)
    {
        $user = User::with(['adminProfile', 'managerProfile', 'employeeProfile'])->findOrFail($id);

        return response()->json($this->attachProfileMeta($user));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,manager,employee',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();

        if ($currentUser && $currentUser->id === $user->id) {
            return response()->json([
                'message' => 'You cannot change your own account while logged in.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'role' => 'sometimes|in:admin,manager,employee',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $currentUser = request()->user();

        if ($currentUser && $currentUser->id === $user->id) {
            return response()->json([
                'message' => 'You cannot delete your own account while logged in.',
            ], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Na-delete na ang user.']);
    }
}

//2|SpU6dQnYYzwQEUToFxxrxXPwB0Ltn1fzGz30NXmR882b729a