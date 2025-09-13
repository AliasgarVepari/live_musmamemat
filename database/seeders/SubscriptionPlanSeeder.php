<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name_en' => 'Free',
                'name_ar' => 'مجاني',
                'slug' => 'free',
                'description_en' => 'Basic listing with limited features',
                'description_ar' => 'قائمة أساسية مع ميزات محدودة',
                'price' => 0.00,
                'billing_cycle' => 'monthly',
                'ad_limit' => 3,
                'featured_ads' => 0,
                'featured_ads_count' => 0,
                'has_unlimited_featured_ads' => false,
                'priority_support' => false,
                'analytics' => false,
                'status' => 'active',
            ],
            [
                'name_en' => 'Basic',
                'name_ar' => 'أساسي',
                'slug' => 'basic',
                'description_en' => 'Perfect for small businesses and individuals',
                'description_ar' => 'مثالي للشركات الصغيرة والأفراد',
                'price' => 9.99,
                'billing_cycle' => 'monthly',
                'ad_limit' => 20,
                'featured_ads' => 2,
                'featured_ads_count' => 2,
                'has_unlimited_featured_ads' => false,
                'priority_support' => false,
                'analytics' => true,
                'status' => 'active',
            ],
            [
                'name_en' => 'Premium',
                'name_ar' => 'مميز',
                'slug' => 'premium',
                'description_en' => 'Advanced features for growing businesses',
                'description_ar' => 'ميزات متقدمة للشركات النامية',
                'price' => 19.99,
                'billing_cycle' => 'monthly',
                'ad_limit' => 100,
                'featured_ads' => 10,
                'featured_ads_count' => 10,
                'has_unlimited_featured_ads' => false,
                'priority_support' => true,
                'analytics' => true,
                'status' => 'active',
            ],
            [
                'name_en' => 'Enterprise',
                'name_ar' => 'مؤسسي',
                'slug' => 'enterprise',
                'description_en' => 'Unlimited everything for large businesses',
                'description_ar' => 'غير محدود لكل شيء للشركات الكبيرة',
                'price' => 49.99,
                'billing_cycle' => 'monthly',
                'ad_limit' => 0, // Unlimited
                'featured_ads' => 0, // Unlimited
                'featured_ads_count' => 0,
                'has_unlimited_featured_ads' => true,
                'priority_support' => true,
                'analytics' => true,
                'status' => 'active',
            ],
        ];

        foreach ($plans as $plan) {
            \App\Models\SubscriptionPlan::create($plan);
        }
    }
}
