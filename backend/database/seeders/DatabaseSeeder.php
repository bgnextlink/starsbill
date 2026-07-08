<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Setup Roles
        $roles = [
            'Super Admin',
            'Admin',
            'Finance',
            'NOC',
            'Teknisi',
            'Marketing',
            'Kolektor',
            'Customer'
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // Create Default Super Admin
        $user = User::firstOrCreate([
            'email' => 'admin@starbilling.local'
        ], [
            'name' => 'Super Administrator',
            'password' => Hash::make('admin123'),
            'phone' => '6280000000000',
        ]);

        $user->assignRole('Super Admin');
    }
}
