<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            ConditionSeeder::class,
            GovernorateSeeder::class,
            PriceTypeSeeder::class,
            SocialLinkSeeder::class,
            SubscriptionPlanSeeder::class,
            TestDataSeeder::class, // This will create users, ads, categories, banners, etc.
        ]);

        $this->command->info('🎉 Database seeded successfully!');
        $this->command->info('');
        $this->command->info('Admin Access:');
        $this->command->info('Email: admin@livemusmamemat.com');
        $this->command->info('Password: password');
        $this->command->info('');
        $this->command->info('Test User Access:');
        $this->command->info('Email: user1@example.com (or user2@example.com, etc.)');
        $this->command->info('Password: password');
    }
}
