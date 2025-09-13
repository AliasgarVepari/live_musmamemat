<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SocialLinkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first admin user
        $adminUser = \App\Models\AdminUser::first();
        
        if ($adminUser) {
            // Create sample social links for admin user
            $socialLinks = [
                [
                    'platform' => 'facebook',
                    'url' => 'https://facebook.com/livem9memat',
                    'is_active' => true,
                    'sort_order' => 1,
                ],
                [
                    'platform' => 'instagram',
                    'url' => 'https://instagram.com/livem9memat',
                    'is_active' => true,
                    'sort_order' => 2,
                ],
                [
                    'platform' => 'twitter',
                    'url' => 'https://twitter.com/livem9memat',
                    'is_active' => true,
                    'sort_order' => 3,
                ],
                [
                    'platform' => 'youtube',
                    'url' => 'https://youtube.com/@livem9memat',
                    'is_active' => true,
                    'sort_order' => 4,
                ],
                [
                    'platform' => 'linkedin',
                    'url' => 'https://linkedin.com/company/livem9memat',
                    'is_active' => true,
                    'sort_order' => 5,
                ],
            ];

            foreach ($socialLinks as $linkData) {
                $adminUser->socialLinks()->create($linkData);
            }
        }

        // Get first regular user if exists
        $user = \App\Models\User::first();
        
        if ($user) {
            // Create sample social links for regular user
            $userSocialLinks = [
                [
                    'platform' => 'facebook',
                    'url' => 'https://facebook.com/johndoe',
                    'is_active' => true,
                    'sort_order' => 1,
                ],
                [
                    'platform' => 'instagram',
                    'url' => 'https://instagram.com/johndoe',
                    'is_active' => true,
                    'sort_order' => 2,
                ],
            ];

            foreach ($userSocialLinks as $linkData) {
                $user->socialLinks()->create($linkData);
            }
        }
    }
}
