<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MyProfileController extends Controller
{
    private function relation(Request $request)
    {
        return match ($request->user()->role) {
            'admin' => $request->user()->adminProfile(),
            'manager' => $request->user()->managerProfile(),
            'employee' => $request->user()->employeeProfile(),
        };
    }

    public function show(Request $request)
    {
        return response()->json($this->relation($request)->first() ?? (object) []);
    }

    public function save(Request $request)
    {
        $rules = ['contact_number' => 'nullable|string|max:20'];
        $fields = match ($request->user()->role) {
            'admin' => ['position', 'department', 'office_number'],
            'manager' => ['position', 'department', 'office_number', 'team_name'],
            'employee' => ['prc_license_no', 'specialization'],
        };
        foreach ($fields as $field) {
            $rules[$field] = 'nullable|string|max:'.($field === 'office_number' ? 50 : 255);
        }
        if ($request->user()->role === 'employee') {
            $rules['years_of_experience'] = 'nullable|integer|min:0|max:100';
        }
        $rules['photo'] = 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048';
        $validated = $request->validate($rules);
        unset($validated['photo']);
        $profile = $this->relation($request)->first();
        $oldPhoto = $profile?->photo;
        $newPhoto = null;
        if ($request->hasFile('photo')) {
            $newPhoto = $request->file('photo')->store('avatars', 'local');
            abort_unless($newPhoto, 500, 'Unable to save photo.');
            $validated['photo'] = $newPhoto;
        }
        try {
            $profile = $this->relation($request)->updateOrCreate([], $validated);
        } catch (\Throwable $exception) {
            if ($newPhoto) Storage::disk('local')->delete($newPhoto);
            throw $exception;
        }
        if ($newPhoto && $oldPhoto && str_starts_with($oldPhoto, 'avatars/')) {
            Storage::disk('local')->delete($oldPhoto);
        }
        return response()->json($profile);
    }

    public function photo(Request $request)
    {
        $path = $this->relation($request)->first()?->photo;
        abort_unless($path && str_starts_with($path, 'avatars/') && Storage::disk('local')->exists($path), 404);
        return Storage::disk('local')->response($path, null, ['Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }
}
