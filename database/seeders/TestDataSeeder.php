<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Ad;
use App\Models\Category;
use App\Models\Governorate;
use App\Models\Condition;
use App\Models\PriceType;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Models\Banner;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create categories
        $categories = [
            ['name_en' => 'Electronics', 'name_ar' => 'إلكترونيات', 'slug' => 'electronics', 'icon_url' => '/icons/electronics.svg', 'status' => 'active'],
            ['name_en' => 'Fashion', 'name_ar' => 'أزياء', 'slug' => 'fashion', 'icon_url' => '/icons/fashion.svg', 'status' => 'active'],
            ['name_en' => 'Home & Garden', 'name_ar' => 'المنزل والحديقة', 'slug' => 'home-garden', 'icon_url' => '/icons/home.svg', 'status' => 'active'],
            ['name_en' => 'Vehicles', 'name_ar' => 'مركبات', 'slug' => 'vehicles', 'icon_url' => '/icons/vehicles.svg', 'status' => 'active'],
            ['name_en' => 'Sports', 'name_ar' => 'رياضة', 'slug' => 'sports', 'icon_url' => '/icons/sports.svg', 'status' => 'active'],
        ];

        foreach ($categories as $categoryData) {
            Category::create($categoryData);
        }

        // Create governorates
        $governorates = [
            ['name_en' => 'Kuwait City', 'name_ar' => 'مدينة الكويت', 'slug' => 'kuwait-city', 'is_active' => true],
            ['name_en' => 'Hawalli', 'name_ar' => 'حولي', 'slug' => 'hawalli', 'is_active' => true],
            ['name_en' => 'Ahmadi', 'name_ar' => 'الأحمدي', 'slug' => 'ahmadi', 'is_active' => true],
            ['name_en' => 'Farwaniya', 'name_ar' => 'الفروانية', 'slug' => 'farwaniya', 'is_active' => true],
            ['name_en' => 'Jahra', 'name_ar' => 'الجهراء', 'slug' => 'jahra', 'is_active' => true],
        ];

        foreach ($governorates as $governorateData) {
            Governorate::create($governorateData);
        }

        // Create conditions
        $conditions = [
            ['name_en' => 'New', 'name_ar' => 'جديد', 'slug' => 'new', 'is_active' => true, 'sort_order' => 1],
            ['name_en' => 'Like New', 'name_ar' => 'كالجديد', 'slug' => 'like-new', 'is_active' => true, 'sort_order' => 2],
            ['name_en' => 'Good', 'name_ar' => 'جيد', 'slug' => 'good', 'is_active' => true, 'sort_order' => 3],
            ['name_en' => 'Fair', 'name_ar' => 'مقبول', 'slug' => 'fair', 'is_active' => true, 'sort_order' => 4],
            ['name_en' => 'Poor', 'name_ar' => 'ضعيف', 'slug' => 'poor', 'is_active' => true, 'sort_order' => 5],
        ];

        foreach ($conditions as $conditionData) {
            Condition::create($conditionData);
        }

        // Create price types
        $priceTypes = [
            ['name_en' => 'Fixed Price', 'name_ar' => 'سعر ثابت', 'slug' => 'fixed-price', 'is_active' => true],
            ['name_en' => 'Negotiable', 'name_ar' => 'قابل للتفاوض', 'slug' => 'negotiable', 'is_active' => true],
            ['name_en' => 'Contact for Price', 'name_ar' => 'اتصل للسعر', 'slug' => 'contact-for-price', 'is_active' => true],
            ['name_en' => 'Free', 'name_ar' => 'مجاني', 'slug' => 'free', 'is_active' => true],
        ];

        foreach ($priceTypes as $priceTypeData) {
            PriceType::create($priceTypeData);
        }

        // Create subscription plans
        $plans = [
            [
                'name_en' => 'Basic Plan',
                'name_ar' => 'الخطة الأساسية',
                'slug' => 'basic-plan',
                'description_en' => 'Basic features for new users',
                'description_ar' => 'ميزات أساسية للمستخدمين الجدد',
                'price' => 9.99,
                'billing_cycle' => 'monthly',
                'ad_limit' => 5,
                'featured_ads' => 1,
                'featured_ads_count' => 0,
                'has_unlimited_featured_ads' => false,
                'priority_support' => false,
                'analytics' => false,
                'status' => 'active'
            ],
            [
                'name_en' => 'Premium Plan',
                'name_ar' => 'الخطة المميزة',
                'slug' => 'premium-plan',
                'description_en' => 'Advanced features for power users',
                'description_ar' => 'ميزات متقدمة للمستخدمين المتميزين',
                'price' => 19.99,
                'billing_cycle' => 'monthly',
                'ad_limit' => 20,
                'featured_ads' => 5,
                'featured_ads_count' => 0,
                'has_unlimited_featured_ads' => false,
                'priority_support' => true,
                'analytics' => true,
                'status' => 'active'
            ],
        ];

        foreach ($plans as $planData) {
            SubscriptionPlan::create($planData);
        }

        // Create test users
        $users = [];
        for ($i = 1; $i <= 10; $i++) {
            $user = User::create([
                'email' => "user{$i}@example.com",
                'password' => Hash::make('password'),
                'name_en' => "User {$i}",
                'name_ar' => "مستخدم {$i}",
                'phone' => "+9651234567{$i}",
                'governate_id' => rand(1, 5),
                'is_subscribed' => $i <= 7, // 7 out of 10 users subscribed
                'subscription_expires_at' => $i <= 7 ? now()->addMonth() : null,
                'ads_count' => rand(0, 5),
                'featured_ads_count' => rand(0, 2),
                'profile_view_counts' => rand(0, 50),
            ]);
            $users[] = $user;
        }

        // Create subscriptions for subscribed users
        $basicPlan = SubscriptionPlan::where('slug', 'basic-plan')->first();
        $premiumPlan = SubscriptionPlan::where('slug', 'premium-plan')->first();
        
        foreach ($users as $index => $user) {
            if ($user->is_subscribed) {
                $plan = $index % 2 == 0 ? $basicPlan : $premiumPlan;
                UserSubscription::create([
                    'user_id' => $user->id,
                    'subscription_plan_id' => $plan->id,
                    'status' => 'active',
                    'starts_at' => now()->subDays(rand(1, 30)),
                    'expires_at' => now()->addMonth(),
                    'payment_method' => 'credit_card',
                    'payment_id' => 'pay_' . rand(100000, 999999),
                    'amount_paid' => $plan->price,
                ]);
            }
        }

        // Create test ads
        $adTitles = [
            'iPhone 13 Pro Max - Excellent Condition',
            'Samsung Galaxy S22 Ultra - Brand New',
            'MacBook Pro M2 - Like New',
            'Nike Air Jordan 1 - Size 10',
            'Adidas Ultraboost 22 - Size 9',
            'Toyota Camry 2020 - Low Mileage',
            'Honda Civic 2019 - Well Maintained',
            'Gaming PC RTX 3080 - High Performance',
            'Sony PlayStation 5 - Bundle Deal',
            'Canon EOS R5 Camera - Professional',
        ];

        $statuses = ['pending', 'approved', 'rejected'];
        $categories = Category::all();
        $governorates = Governorate::all();
        $conditions = Condition::all();
        $priceTypes = PriceType::all();

        foreach ($users as $index => $user) {
            $adCount = rand(1, 3); // Each user has 1-3 ads
            
            for ($j = 0; $j < $adCount; $j++) {
                $titleIndex = ($index * $adCount + $j) % count($adTitles);
                $isFeatured = rand(0, 10) < 3; // 30% chance of being featured
                
                Ad::create([
                    'user_id' => $user->id,
                    'category_id' => $categories->random()->id,
                    'title_en' => $adTitles[$titleIndex],
                    'title_ar' => "إعلان {$index}-{$j}",
                    'slug' => 'ad-' . $index . '-' . $j,
                    'description_en' => 'This is a test ad description. Great product in excellent condition.',
                    'description_ar' => 'هذا وصف إعلان تجريبي. منتج رائع في حالة ممتازة.',
                    'price' => rand(50, 2000),
                    'price_type_id' => $priceTypes->random()->id,
                    'condition_id' => $conditions->random()->id,
                    'governorate_id' => $governorates->random()->id,
                    'status' => $statuses[array_rand($statuses)],
                    'is_featured' => $isFeatured,
                    'is_negotiable' => rand(0, 1) == 1,
                    'is_approved' => rand(0, 1) == 1,
                    'views_count' => rand(0, 100),
                    'contact_count' => rand(0, 20),
                ]);
            }
        }

        // Create some banners
        $banners = [
            [
                'image_url' => '/banners/banner1.jpg',
                'link_url' => 'https://example.com/promotion1',
                'position' => 'top',
                'status' => 'active',
                'created_by' => 'Admin',
                'created_by_id' => 1,
                'is_approved' => true,
                'click_count' => rand(0, 50),
            ],
            [
                'image_url' => '/banners/banner2.jpg',
                'link_url' => 'https://example.com/promotion2',
                'position' => 'sidebar',
                'status' => 'active',
                'created_by' => 'Admin',
                'created_by_id' => 1,
                'is_approved' => true,
                'click_count' => rand(0, 30),
            ],
        ];

        foreach ($banners as $bannerData) {
            Banner::create($bannerData);
        }

        $this->command->info('Test data created successfully!');
        $this->command->info('Created:');
        $this->command->info('- ' . Category::count() . ' categories');
        $this->command->info('- ' . Governorate::count() . ' governorates');
        $this->command->info('- ' . Condition::count() . ' conditions');
        $this->command->info('- ' . PriceType::count() . ' price types');
        $this->command->info('- ' . SubscriptionPlan::count() . ' subscription plans');
        $this->command->info('- ' . User::count() . ' users');
        $this->command->info('- ' . UserSubscription::count() . ' subscriptions');
        $this->command->info('- ' . Ad::count() . ' ads');
        $this->command->info('- ' . Banner::count() . ' banners');
    }
}