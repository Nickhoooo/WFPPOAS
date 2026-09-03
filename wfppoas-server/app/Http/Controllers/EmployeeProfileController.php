<?php

namespace App\Http\Controllers;

use App\Models\EmployeeProfile;
use App\Models\User;
use Illuminate\Http\Request;

class EmployeeProfileController extends Controller
{
    public function show($userId)
    {
        $profile = EmployeeProfile::where('user_id', $userId)->first();

        if (!$profile) {
            return response()->json(['message' => 'Wala pang profile ang user na ito.'], 404);
        }

        return response()->json($profile);
    }

    public function store(Request $request, $userId)
    {
        User::findOrFail($userId);

        $existing = EmployeeProfile::where('user_id', $userId)->first();
        if ($existing) {
            return response()->json(['message' => 'May profile na ang user na ito. Gamitin ang update.'], 409);
        }

        $validated = $request->validate([
            'prc_license_no' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'years_of_experience' => 'nullable|integer|min:0',
            'contact_number' => 'nullable|string|max:20',
        ]);

        $validated['user_id'] = $userId;

        $profile = EmployeeProfile::create($validated);

        return response()->json($profile, 201);
    }

    public function update(Request $request, $userId)
    {
        $profile = EmployeeProfile::where('user_id', $userId)->firstOrFail();

        $validated = $request->validate([
            'prc_license_no' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'years_of_experience' => 'nullable|integer|min:0',
            'contact_number' => 'nullable|string|max:20',
        ]);

        $profile->update($validated);

        return response()->json($profile);
    }
}