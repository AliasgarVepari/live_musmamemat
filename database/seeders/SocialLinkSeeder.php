<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class SocialLinkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create general social links (not tied to specific users)
        $socialLinks = [
            [
                'platform'  => 'facebook',
                'url'       => 'https://facebook.com/livem9memat',
                'is_active' => true,
            ],
            [
                'platform'  => 'instagram',
                'url'       => 'https://instagram.com/livem9memat',
                'is_active' => true,
            ],
            [
                'platform'  => 'twitter',
                'url'       => 'https://twitter.com/livem9memat',
                'is_active' => true,
            ],
            [
                'platform'  => 'youtube',
                'url'       => 'https://youtube.com/@livem9memat',
                'is_active' => true,
            ],
            [
                'platform'  => 'linkedin',
                'url'       => 'https://linkedin.com/company/livem9memat',
                'is_active' => true,
            ],
        ];

        foreach ($socialLinks as $linkData) {
            \App\Models\SocialLink::create($linkData);
        }
    }
}
