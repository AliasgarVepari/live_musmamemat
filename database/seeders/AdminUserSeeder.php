<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\AdminUser::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => \Hash::make('password'),
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        \App\Models\AdminUser::create([
            'name' => 'Admin User',
            'email' => 'admin2@example.com',
            'password' => \Hash::make('password'),
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }
}
