<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:create-admin', function () {
    if (\App\Models\User::where('role', 'admin')->exists()) {
        $this->error('An admin already exists. Use the existing account or review it before proceeding.');
        return 1;
    }
    $name = $this->ask('Admin name');
    $email = $this->ask('Admin email');
    $password = $this->secret('Password (at least 12 characters; input is hidden)');
    $confirmation = $this->secret('Confirm password');
    $validator = \Illuminate\Support\Facades\Validator::make([
        'name' => $name, 'email' => $email,
        'password' => $password, 'password_confirmation' => $confirmation,
    ], [
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255|unique:users,email',
        'password' => 'required|string|min:12|confirmed',
    ]);
    if ($validator->fails()) {
        foreach ($validator->errors()->all() as $error) $this->error($error);
        return 1;
    }
    \App\Models\User::create([
        'name' => $name, 'email' => $email, 'password' => $password,
        'role' => 'admin', 'status' => 'active',
    ]);
    $this->info('Admin created successfully. You can now sign in.');
})->purpose('Create the first administrator using private interactive prompts');
