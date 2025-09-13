<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PriceTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $priceTypes = [
            [
                'name_en' => 'Fixed Price',
                'name_ar' => 'سعر ثابت',
                'slug' => 'fixed-price',
                'is_active' => true,
            ],
            [
                'name_en' => 'Negotiable',
                'name_ar' => 'قابل للتفاوض',
                'slug' => 'negotiable',
                'is_active' => true,
            ],
            [
                'name_en' => 'Free',
                'name_ar' => 'مجاني',
                'slug' => 'free',
                'is_active' => true,
            ],
            [
                'name_en' => 'Contact for Price',
                'name_ar' => 'اتصل للسعر',
                'slug' => 'contact-for-price',
                'is_active' => true,
            ],
            [
                'name_en' => 'Auction',
                'name_ar' => 'مزاد',
                'slug' => 'auction',
                'is_active' => true,
            ],
        ];

        foreach ($priceTypes as $priceType) {
            \App\Models\PriceType::create($priceType);
        }
    }
}
