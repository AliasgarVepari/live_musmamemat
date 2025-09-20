<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ConditionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $conditions = [
            [
                'name_en'   => 'New',
                'name_ar'   => 'جديد',
                'slug'      => 'new',
                'is_active' => true,
            ],
            [
                'name_en'   => 'Like New',
                'name_ar'   => 'كالجديد',
                'slug'      => 'like-new',
                'is_active' => true,
            ],
            [
                'name_en'   => 'Good',
                'name_ar'   => 'جيد',
                'slug'      => 'good',
                'is_active' => true,
            ],
            [
                'name_en'   => 'Fair',
                'name_ar'   => 'مقبول',
                'slug'      => 'fair',
                'is_active' => true,
            ],
            [
                'name_en'   => 'Poor',
                'name_ar'   => 'ضعيف',
                'slug'      => 'poor',
                'is_active' => true,
            ],
        ];

        foreach ($conditions as $condition) {
            \App\Models\Condition::create($condition);
        }
    }
}
