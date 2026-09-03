<?php

namespace App\Http\Controllers;

use App\Models\ManagerProfile;
use App\Models\User;
use Illuminate\Http\Request;

class ManagerProfileController extends Controller
{
    public function show($userId)
    {
        $profile = ManagerProfile::where('user_id', $userId)->first();

        if (!$profile) {
            return response()->json(['message' => 'Wala pang manager profile ang user na ito.'], 404);
        }

        return response()->json($profile);
    }

    public function store(Request $request, $userId)
    {
        User::findOrFail($userId);

        $existing = ManagerProfile::where('user_id', $userId)->first();
        if ($existing) {
            return response()->json(['message' => 'May manager profile na ang user na ito. Gamitin ang update.'], 409);
        }

        $validated = $request->validate([
            'position' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'team_name' => 'nullable|string|max:255',
            'office_number' => 'nullable|string|max:50',
            'contact_number' => 'nullable|string|max:20',
            'photo' => 'nullable|string|max:255',
        ]);

        $validated['user_id'] = $userId;

        $profile = ManagerProfile::create($validated);

        return response()->json($profile, 201);
    }

    public function update(Request $request, $userId)
    {
        $profile = ManagerProfile::where('user_id', $userId)->firstOrFail();

        $validated = $request->validate([
            'position' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'team_name' => 'nullable|string|max:255',
            'office_number' => 'nullable|string|max:50',
            'contact_number' => 'nullable|string|max:20',
            'photo' => 'nullable|string|max:255',
        ]);

        $profile->update($validated);

        return response()->json($profile);
    }
}
