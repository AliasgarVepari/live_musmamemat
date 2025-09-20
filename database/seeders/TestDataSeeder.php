<?php
namespace Database\Seeders;

use App\Models\Ad;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Condition;
use App\Models\Governorate;
use App\Models\PriceType;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Database\Seeder;
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
            ['name_en' => 'Electronics', 'name_ar' => 'إلكترونيات', 'slug' => 'electronics', 'icon_name' => 'smartphone', 'status' => 'active'],
            ['name_en' => 'Fashion', 'name_ar' => 'أزياء', 'slug' => 'fashion', 'icon_name' => 'shirt', 'status' => 'active'],
            ['name_en' => 'Home & Garden', 'name_ar' => 'المنزل والحديقة', 'slug' => 'home-garden', 'icon_name' => 'home', 'status' => 'active'],
            ['name_en' => 'Vehicles', 'name_ar' => 'مركبات', 'slug' => 'vehicles', 'icon_name' => 'car', 'status' => 'active'],
            ['name_en' => 'Sports', 'name_ar' => 'رياضة', 'slug' => 'sports', 'icon_name' => 'dumbbell', 'status' => 'active'],
        ];

        foreach ($categories as $categoryData) {
            Category::create($categoryData);
        }

        // Create test users
        $users        = [];
        $governorates = Governorate::all();

        for ($i = 1; $i <= 15; $i++) {
            $user = User::create([
                'email' => "user{$i}@example.com",
                'password' => Hash::make('password'),
                'name_en'  => "User {$i}",
                'name_ar' => "مستخدم {$i}",
                'phone'                   => "+965" . str_pad(rand(20000000, 99999999), 8, '0', STR_PAD_LEFT),
                'governorate_id'          => $governorates->random()->id,
                'status'                  => $i <= 12 ? 'active' : 'suspended', // Most users are active
                'is_subscribed'           => $i <= 10,                          // 10 out of 15 users subscribed
                'subscription_expires_at' => $i <= 10 ? now()->addMonth() : null,
                'ads_count'               => rand(0, 8),
                'featured_ads_count'      => rand(0, 3),
                'profile_view_counts'     => rand(50, 500),
            ]);
            $users[] = $user;
        }

        // Create subscriptions for subscribed users
        $subscriptionPlans = SubscriptionPlan::all();

        foreach ($users as $index => $user) {
            if ($user->is_subscribed) {
                $plan = $subscriptionPlans->random();
                UserSubscription::create([
                    'user_id'              => $user->id,
                    'subscription_plan_id' => $plan->id,
                    'status'               => rand(1, 10) <= 8 ? 'active' : 'expired', // 80% active
                    'starts_at'            => now()->subDays(rand(1, 60)),
                    'expires_at'           => now()->addMonth(),
                    'payment_method'       => ['credit_card', 'debit_card', 'knet'][array_rand(['credit_card', 'debit_card', 'knet'])],
                    'payment_id'           => 'pay_' . rand(100000, 999999),
                    'amount_paid'          => $plan->price,
                ]);
            }
        }

        // Create test ads
        $adTitles = [
            'iPhone 15 Pro Max - Excellent Condition',
            'Samsung Galaxy S24 Ultra - Brand New',
            'MacBook Pro M3 - Like New',
            'Nike Air Jordan 1 - Size 10',
            'Adidas Ultraboost 22 - Size 9',
            'Toyota Camry 2023 - Low Mileage',
            'Honda Civic 2022 - Well Maintained',
            'Gaming PC RTX 4080 - High Performance',
            'Sony PlayStation 5 - Bundle Deal',
            'Canon EOS R6 Camera - Professional',
            'Luxury Watch - Rolex Submariner',
            'Designer Handbag - Louis Vuitton',
            'Vintage Guitar - Fender Stratocaster',
            'Mountain Bike - Trek X-Caliber',
            'Dining Table Set - Oak Wood',
            'Smart TV 75 inch - Samsung QLED',
            'Air Conditioner - Split Type',
            'Washing Machine - Front Load',
            'Office Chair - Ergonomic Design',
            'Sofa Set - 3+2+1 Leather',
        ];

        $statuses   = ['active', 'inactive', 'draft', 'sold'];
        $categories = Category::all();
        $conditions = Condition::all();
        $priceTypes = PriceType::all();

        foreach ($users as $index => $user) {
            $adCount = rand(2, 5); // Each user has 2-5 ads

            for ($j = 0; $j < $adCount; $j++) {
                $titleIndex = ($index * $adCount + $j) % count($adTitles);
                $isFeatured = rand(0, 10) < 3;                                           // 30% chance of being featured
                $isApproved = rand(0, 10) < 8 ? true : (rand(0, 10) < 5 ? false : null); // 80% approved, 10% rejected, 10% pending

                Ad::create([
                    'user_id'     => $user->id,
                    'category_id' => $categories->random()->id,
                    'title_en'    => $adTitles[$titleIndex],
                    'title_ar'    => "إعلان {$titleIndex}",
                    'slug'               => 'ad-' . $user->id . '-' . $j . '-' . time(),
                    'description_en'     => 'This is a comprehensive ad description. The product is in excellent condition and comes with all original accessories. Perfect for someone looking for quality and reliability.',
                    'description_ar'     => 'هذا وصف إعلان شامل. المنتج في حالة ممتازة ويأتي مع جميع الإكسسوارات الأصلية. مثالي لمن يبحث عن الجودة والموثوقية.',
                    'product_details_en' => 'Additional product details and specifications go here.',
                    'product_details_ar' => 'تفاصيل ومواصفات إضافية للمنتج تذهب هنا.',
                    'price'              => rand(50, 5000),
                    'price_type_id'      => $priceTypes->random()->id,
                    'condition_id'       => $conditions->random()->id,
                    'governorate_id'     => $governorates->random()->id,
                    'status'             => $statuses[array_rand($statuses)],
                    'is_featured'        => $isFeatured,
                    'is_negotiable'      => rand(0, 1) == 1,
                    'is_approved'        => $isApproved,
                    'views_count'        => rand(10, 500),
                    'contact_count'      => rand(0, 50),
                ]);
            }
        }

        // Create some banners (with placeholder images for now)
        $banners = [
            [
                'image_url_en'  => 'https://via.placeholder.com/800x300/4F46E5/ffffff?text=Top+Banner+EN',
                'image_url_ar'  => 'https://via.placeholder.com/800x300/4F46E5/ffffff?text=Top+Banner+AR',
                'position'      => 'top',
                'status'        => 'active',
                'created_by'    => 'admin',
                'created_by_id' => 1,
                'is_approved'   => true,
                'click_count'   => rand(50, 200),
            ],
            [
                'image_url_en'  => 'https://via.placeholder.com/800x300/10B981/ffffff?text=Bottom+Banner+EN',
                'image_url_ar'  => 'https://via.placeholder.com/800x300/10B981/ffffff?text=Bottom+Banner+AR',
                'position'      => 'bottom',
                'status'        => 'active',
                'created_by'    => 'admin',
                'created_by_id' => 1,
                'is_approved'   => true,
                'click_count'   => rand(30, 150),
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
