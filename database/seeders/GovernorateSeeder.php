<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GovernorateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $governorates = [
            [
                'name_en' => 'Kuwait City',
                'name_ar' => 'مدينة الكويت',
                'slug' => 'kuwait-city',
                'is_active' => true,
            ],
            [
                'name_en' => 'Hawalli',
                'name_ar' => 'حولي',
                'slug' => 'hawalli',
                'is_active' => true,
            ],
            [
                'name_en' => 'Farwaniya',
                'name_ar' => 'الفروانية',
                'slug' => 'farwaniya',
                'is_active' => true,
            ],
            [
                'name_en' => 'Ahmadi',
                'name_ar' => 'الأحمدي',
                'slug' => 'ahmadi',
                'is_active' => true,
            ],
            [
                'name_en' => 'Jahra',
                'name_ar' => 'الجهراء',
                'slug' => 'jahra',
                'is_active' => true,
            ],
            [
                'name_en' => 'Mubarak Al-Kabeer',
                'name_ar' => 'مبارك الكبير',
                'slug' => 'mubarak-al-kabeer',
                'is_active' => true,
            ],
        ];

        foreach ($governorates as $governorate) {
            \App\Models\Governorate::create($governorate);
        }
    }
}
