<?php

namespace App\Http\Controllers;

use App\Models\AccountInvitation;
use App\Models\AdminProfile;
use App\Models\EmployeeProfile;
use App\Models\ManagerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class InvitationController extends Controller
{
    public function show(string $token)
    {
        $invitation = $this->findValidInvitation($token);

        if (!$invitation) {
            return response()->json(['message' => 'This invitation is invalid or expired.'], 400);
        }

        return response()->json([
            'name' => $invitation->user->name,
            'email' => $invitation->user->email,
            'role' => $invitation->user->role,
        ]);
    }

    public function setup(Request $request, string $token)
    {
        $invitation = $this->findValidInvitation($token);

        if (!$invitation) {
            return response()->json(['message' => 'This invitation is invalid or expired.'], 400);
        }

        $user = $invitation->user;
        $roleRules = $this->roleProfileRules($user->role);

        $validated = $request->validate(array_merge([
            'password' => 'required|string|min:8|confirmed',
        ], $roleRules));

        DB::transaction(function () use ($user, $invitation, $validated) {
            $user->update([
                'password' => Hash::make($validated['password']),
                'status' => 'active',
            ]);

            $profileData = $this->profileDataForRole($validated, $user->role);

            if ($user->role === 'admin') {
                AdminProfile::updateOrCreate(
                    ['user_id' => $user->id],
                    $profileData
                );
            }

            if ($user->role === 'manager') {
                ManagerProfile::updateOrCreate(
                    ['user_id' => $user->id],
                    $profileData
                );
            }

            if ($user->role === 'employee') {
                EmployeeProfile::updateOrCreate(
                    ['user_id' => $user->id],
                    $profileData
                );
            }

            $invitation->update(['accepted_at' => now()]);
        });

        return response()->json(['message' => 'Account setup completed successfully.']);
    }

    private function roleProfileRules(string $role): array
    {
        return match ($role) {
            'admin' => [
                'position' => 'nullable|string|max:255',
                'department' => 'nullable|string|max:255',
                'office_number' => 'nullable|string|max:50',
                'contact_number' => 'nullable|string|max:20',
                'photo' => 'nullable|string|max:255',
            ],
            'manager' => [
                'position' => 'nullable|string|max:255',
                'department' => 'nullable|string|max:255',
                'team_name' => 'nullable|string|max:255',
                'office_number' => 'nullable|string|max:50',
                'contact_number' => 'nullable|string|max:20',
                'photo' => 'nullable|string|max:255',
            ],
            'employee' => [
                'prc_license_no' => 'nullable|string|max:255',
                'specialization' => 'nullable|string|max:255',
                'years_of_experience' => 'nullable|integer|min:0',
                'contact_number' => 'nullable|string|max:20',
                'photo' => 'nullable|string|max:255',
            ],
            default => [],
        };
    }

    private function profileDataForRole(array $validated, string $role): array
    {
        return match ($role) {
            'admin' => [
                'position' => $validated['position'] ?? null,
                'department' => $validated['department'] ?? null,
                'office_number' => $validated['office_number'] ?? null,
                'contact_number' => $validated['contact_number'] ?? null,
                'photo' => $validated['photo'] ?? null,
            ],
            'manager' => [
                'position' => $validated['position'] ?? null,
                'department' => $validated['department'] ?? null,
                'team_name' => $validated['team_name'] ?? null,
                'office_number' => $validated['office_number'] ?? null,
                'contact_number' => $validated['contact_number'] ?? null,
                'photo' => $validated['photo'] ?? null,
            ],
            'employee' => [
                'prc_license_no' => $validated['prc_license_no'] ?? null,
                'specialization' => $validated['specialization'] ?? null,
                'years_of_experience' => $validated['years_of_experience'] ?? null,
                'contact_number' => $validated['contact_number'] ?? null,
                'photo' => $validated['photo'] ?? null,
            ],
            default => [],
        };
    }

    private function findValidInvitation(string $plainToken): ?AccountInvitation
    {
        return AccountInvitation::with('user')
            ->where('token', hash('sha256', $plainToken))
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->first();
    }
}
