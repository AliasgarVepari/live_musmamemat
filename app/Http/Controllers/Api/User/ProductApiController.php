<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Category;
use App\Models\Condition;
use App\Models\Favorite;
use App\Models\Governorate;
use App\Models\PriceType;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductApiController extends Controller
{
    /**
     * Get products with filtering, searching, and pagination
     */
    public function index(Request $request)
    {
        $query = Ad::where('status', 'active')
            ->where('is_approved', true)
            ->with(['category:id,name_en,name_ar,slug', 'governorate:id,name_en,name_ar', 'primaryImage', 'priceType:id,name_en,name_ar', 'condition:id,name_en,name_ar', 'user:id,name_en,name_ar,profile_picture_url,created_at']);
        // Category filter
        if ($request->filled('category') && $request->category !== 'all') {
            $category = Category::where('slug', $request->category)->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // Search functionality
        if ($request->filled('search')) {
            $search     = $request->search;
            $searchType = $request->get('type', 'all');

            switch ($searchType) {
                case 'product':
                    $query->where(function ($q) use ($search) {
                        $q->where('title_en', 'like', "%{$search}%")
                            ->orWhere('title_ar', 'like', "%{$search}%")
                            ->orWhere('description_en', 'like', "%{$search}%")
                            ->orWhere('description_ar', 'like', "%{$search}%");
                    });
                    break;
                case 'category':
                    $query->whereHas('category', function ($q) use ($search) {
                        $q->where('name_en', 'like', "%{$search}%")
                            ->orWhere('name_ar', 'like', "%{$search}%");
                    });
                    break;
                default: // 'all'
                    $query->where(function ($q) use ($search) {
                        $q->where('title_en', 'like', "%{$search}%")
                            ->orWhere('title_ar', 'like', "%{$search}%")
                            ->orWhere('description_en', 'like', "%{$search}%")
                            ->orWhere('description_ar', 'like', "%{$search}%")
                            ->orWhereHas('category', function ($subQ) use ($search) {
                                $subQ->where('name_en', 'like', "%{$search}%")
                                    ->orWhere('name_ar', 'like', "%{$search}%");
                            });
                    });
            }
        }

        // Filters
        if ($request->filled('governorate_id') && $request->governorate_id !== 'all') {
            $query->where('governorate_id', $request->governorate_id);
        }

        if ($request->filled('condition_id') && $request->condition_id !== 'all') {
            $query->where('condition_id', $request->condition_id);
        }

        if ($request->filled('price_type_id') && $request->price_type_id !== 'all') {
            $query->where('price_type_id', $request->price_type_id);
        }

        if ($request->filled('min_price') && is_numeric($request->min_price)) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price') && is_numeric($request->max_price)) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('is_negotiable') && $request->is_negotiable !== 'all') {
            $query->where('is_negotiable', $request->is_negotiable === 'true');
        }

        // Sorting
        $sortBy = $request->get('sort', 'newest');
        switch ($sortBy) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'popular':
                $query->orderBy('views_count', 'desc');
                break;
            default: // 'newest'
                $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [5, 12, 24, 48]) ? $perPage : 20;

        $products = $query->paginate($perPage);

        // Transform the response data to use camelCase for primaryImage
        $responseData = $products->toArray();
        if (isset($responseData['data'])) {
            foreach ($responseData['data'] as &$product) {
                $product['primaryImage'] = $product['primary_image'] ?? null;
                unset($product['primary_image']);
            }
        }

        return response()->json($responseData);
    }

    /**
     * Get single product
     */
    public function show($id)
    {
        $product = Ad::where('id', $id)
            ->where('status', 'active')
            ->where('is_approved', true)
            ->with([
                'category:id,name_en,name_ar,slug',
                'governorate:id,name_en,name_ar',
                'condition:id,name_en,name_ar',
                'priceType:id,name_en,name_ar',
                'primaryImage',
                'images',
                'user:id,name_en,name_ar,phone,email,created_at',
            ])
            ->firstOrFail();

        // Increment views count
        $product->increment('views_count');

        // Get related products
        $relatedProducts = Ad::where('status', 'active')
            ->where('is_approved', true)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category:id,name_en,name_ar', 'governorate:id,name_en,name_ar', 'primaryImage'])
            ->limit(4)
            ->get();

        // Transform the response data to use camelCase for primaryImage
        $productData = $product->toArray();
        $productData['primaryImage'] = $productData['primary_image'] ?? null;
        unset($productData['primary_image']);

        $relatedProductsData = $relatedProducts->map(function ($relatedProduct) {
            $data = $relatedProduct->toArray();
            $data['primaryImage'] = $data['primary_image'] ?? null;
            unset($data['primary_image']);
            return $data;
        });

        return response()->json([
            'product'         => $productData,
            'relatedProducts' => $relatedProductsData,
        ]);
    }

    /**
     * Get categories
     */
    public function categories()
    {
        $categories = Category::where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('name_en')
            ->get(['id', 'name_en', 'name_ar', 'slug', 'icon_url', 'sort_order']);

        return response()->json($categories);
    }

    /**
     * Get governorates
     */
    public function governorates()
    {
        $governorates = Governorate::where('is_active', true)
            ->orderBy('name_en')
            ->get(['id', 'name_en', 'name_ar']);

        return response()->json($governorates);
    }

    /**
     * Get conditions
     */
    public function conditions()
    {
        $conditions = Condition::where('is_active', true)
            ->orderBy('name_en')
            ->get(['id', 'name_en', 'name_ar']);

        return response()->json($conditions);
    }

    /**
     * Get price types
     */
    public function priceTypes()
    {
        $priceTypes = PriceType::where('is_active', true)
            ->orderBy('name_en')
            ->get(['id', 'name_en', 'name_ar']);

        return response()->json($priceTypes);
    }

    /**
     * Store a new ad
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'title_en' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description_en' => 'required|string|max:2000',
            'description_ar' => 'required|string|max:2000',
            'product_details_en' => 'nullable|string|max:5000',
            'product_details_ar' => 'nullable|string|max:5000',
            'condition_id' => 'required|exists:conditions,id',
            'governorate_id' => 'required|exists:governorates,id',
            'price' => 'required|numeric|min:0',
            'price_type_id' => 'required|exists:price_types,id',
            'is_negotiable' => 'boolean',
            'status' => 'nullable|in:draft,active,pending',
            'current_step' => 'nullable|integer|min:1|max:4',
            'images' => 'nullable|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max per image
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::guard('sanctum')->user();

        // Check if user has active subscription and can create ads
        $userSubscription = $user->subscription;
        $hasActiveSubscription = $this->userHasActiveSubscription($user->id);
        $canCreateAd = $userSubscription && $userSubscription->canCreateAd();
        $subscriptionPlanId = $request->input('subscription_plan_id');
        
        // Validate that user can create ads
        if (!$hasActiveSubscription && !$subscriptionPlanId) {
            return response()->json([
                'success' => false,
                'message' => 'You need an active subscription or must select a subscription plan to create ads',
                'error_code' => 'NO_SUBSCRIPTION'
            ], 403);
        }
        
        // If user has subscription but no allowance, check if they can upgrade
        if ($hasActiveSubscription && !$canCreateAd && !$subscriptionPlanId) {
            return response()->json([
                'success' => false,
                'message' => 'You have reached your monthly ad limit. Your allowance will reset next month or you can upgrade your subscription.',
                'error_code' => 'MONTHLY_LIMIT_EXCEEDED',
                'remaining_ads' => $userSubscription ? $userSubscription->usable_ad_for_this_month : 0
            ], 403);
        }
        
        // Always create as active - no more drafts
        $finalStatus = 'active';
        $isApproved = null; // Active ads await approval
        
        // If user has subscription and can create ads, deduct allowance
        if ($hasActiveSubscription && $canCreateAd) {
            $userSubscription->deductAdAllowance();
        }

        $ad = Ad::create([
            'user_id' => $user->id,
            'category_id' => $request->category_id,
            'title_en' => $request->title_en,
            'title_ar' => $request->title_ar,
            'slug' => Ad::generateSlug($request->title_en),
            'description_en' => $request->description_en,
            'description_ar' => $request->description_ar,
            'product_details_en' => $request->product_details_en,
            'product_details_ar' => $request->product_details_ar,
            'condition_id' => $request->condition_id,
            'governorate_id' => $request->governorate_id,
            'price' => $request->price,
            'price_type_id' => $request->price_type_id,
            'is_negotiable' => $request->boolean('is_negotiable', false),
            'status' => $finalStatus,
            'current_step' => $request->input('current_step', 1),
            'is_approved' => $isApproved,
        ]);

        // Allowance deducted above if user has subscription

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                // Upload to S3
                $path = $image->store('ads/' . $ad->id, 's3');
                $url = Storage::disk('s3')->url($path);
                
                $ad->images()->create([
                    'filename' => $image->getClientOriginalName(),
                    'original_name' => $image->getClientOriginalName(),
                    'path' => $path,
                    'url' => $url,
                    'mime_type' => $image->getMimeType(),
                    'file_size' => $image->getSize(),
                    'is_primary' => $index === 0, // First image is primary
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Ad created successfully',
            'data' => [
                'ad' => $ad->load(['category', 'governorate', 'condition', 'priceType', 'images']),
            ],
        ], 201);
    }

    /**
     * Update an existing ad (for draft updates)
     */
    public function update(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user();
        $ad = Ad::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Ad not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'subscription_plan_id' => 'nullable|exists:subscription_plans,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Only handle subscription assignment for non-subscribed users
        if ($request->subscription_plan_id) {
            $this->assignSubscriptionToAd($ad, $request->subscription_plan_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ad updated successfully',
            'data' => [
                'ad' => $ad->load(['category', 'governorate', 'condition', 'priceType', 'images']),
            ],
        ]);
    }

    /**
     * Check if user is eligible for upgrade
     */
    public function checkUpgradeEligibility()
    {
        $user = Auth::guard('sanctum')->user();
        $userSubscription = $user->subscription;

        if (!$userSubscription || !$userSubscription->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found',
                'eligible' => false
            ], 400);
        }

        $currentPlan = $userSubscription->subscriptionPlan;
        
        // Check if there are any plans with higher price and higher ad_limit
        $eligiblePlans = SubscriptionPlan::where('status', 'active')
            ->where('price', '>', $currentPlan->price)
            ->where('ad_limit', '>', $currentPlan->ad_limit)
            ->exists();

        return response()->json([
            'success' => true,
            'eligible' => $eligiblePlans,
            'message' => $eligiblePlans 
                ? 'You are eligible for upgrade' 
                : 'No upgrade options available. You already have the highest plan or no better plans exist.',
            'current_plan' => [
                'id' => $currentPlan->id,
                'name_en' => $currentPlan->name_en,
                'name_ar' => $currentPlan->name_ar,
                'price' => $currentPlan->price,
                'ad_limit' => $currentPlan->ad_limit
            ]
        ]);
    }

    /**
     * Get upgrade subscription plans (higher price and ad_limit than current)
     */
    public function upgradeSubscriptionPlans()
    {
        $user = Auth::guard('sanctum')->user();
        $userSubscription = $user->subscription;

        if (!$userSubscription || !$userSubscription->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found'
            ], 400);
        }

        $currentPlan = $userSubscription->subscriptionPlan;
        
        // Get plans with higher price and higher ad_limit
        $upgradePlans = SubscriptionPlan::where('status', 'active')
            ->where('price', '>', $currentPlan->price)
            ->where('ad_limit', '>', $currentPlan->ad_limit)
            ->where('id', '<>', $currentPlan->id)
            ->orderBy('price', 'asc')
            ->get([
                'id',
                'name_en',
                'name_ar',
                'slug',
                'description_en',
                'description_ar',
                'price',
                'months_count',
                'is_lifetime',
                'readable_billing_cycle',
                'ad_limit',
                'featured_ads',
                'featured_ads_count',
                'has_unlimited_featured_ads',
                'priority_support',
                'analytics',
                'status'
            ]);

        // Generate readable billing cycle for plans that don't have it
        $upgradePlans->each(function ($plan) {
            if (empty($plan->readable_billing_cycle)) {
                $plan->readable_billing_cycle = $plan->generateReadableBillingCycle();
            }
        });

        // Calculate discount for each plan
        $discount = $this->calculatePlanDiscount($userSubscription, $currentPlan);
        $upgradePlansWithDiscount = $upgradePlans->map(function ($plan) use ($discount) {
            $plan->original_price = $plan->price;
            $plan->discounted_price = max(0, floatval($plan->price) - $discount);
            $plan->discount_amount = $discount;
            return $plan;
        });

        return response()->json([
            'success' => true,
            'data' => $upgradePlansWithDiscount,
            'current_plan' => [
                'id' => $currentPlan->id,
                'name_en' => $currentPlan->name_en,
                'name_ar' => $currentPlan->name_ar,
                'slug' => $currentPlan->slug,
                'description_en' => $currentPlan->description_en,
                'description_ar' => $currentPlan->description_ar,
                'price' => $currentPlan->price,
                'months_count' => $currentPlan->months_count,
                'is_lifetime' => $currentPlan->is_lifetime,
                'readable_billing_cycle' => $currentPlan->readable_billing_cycle ?: $currentPlan->generateReadableBillingCycle(),
                'ad_limit' => $currentPlan->ad_limit,
                'featured_ads' => $currentPlan->featured_ads,
                'featured_ads_count' => $currentPlan->featured_ads_count,
                'has_unlimited_featured_ads' => $currentPlan->has_unlimited_featured_ads,
                'priority_support' => $currentPlan->priority_support,
                'analytics' => $currentPlan->analytics,
                'status' => $currentPlan->status
            ]
        ]);
    }

    /**
     * Get upgrade subscription plans for profile (higher price than current)
     */
    public function upgradeSubscriptionPlansForProfile()
    {
        $user = Auth::guard('sanctum')->user();
        $userSubscription = $user->subscription;

        if (!$userSubscription || !$userSubscription->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found'
            ], 400);
        }

        $currentPlan = $userSubscription->subscriptionPlan;
        
        // Get plans with higher price and higher ad_limit
        $upgradePlans = SubscriptionPlan::where('status', 'active')
            ->where('price', '>', $currentPlan->price)
            ->where('id', '<>', $currentPlan->id)
            ->orderBy('price', 'asc')
            ->get([
                'id',
                'name_en',
                'name_ar',
                'slug',
                'description_en',
                'description_ar',
                'price',
                'months_count',
                'is_lifetime',
                'readable_billing_cycle',
                'ad_limit',
                'featured_ads',
                'featured_ads_count',
                'has_unlimited_featured_ads',
                'priority_support',
                'analytics',
                'status'
            ]);

        // Generate readable billing cycle for plans that don't have it
        $upgradePlans->each(function ($plan) {
            if (empty($plan->readable_billing_cycle)) {
                $plan->readable_billing_cycle = $plan->generateReadableBillingCycle();
            }
        });

        // Calculate discount for each plan
        $discount = $this->calculatePlanDiscount($userSubscription, $currentPlan);
        $upgradePlansWithDiscount = $upgradePlans->map(function ($plan) use ($discount) {
            $plan->original_price = $plan->price;
            $plan->discounted_price = max(0, floatval($plan->price) - $discount);
            $plan->discount_amount = $discount;
            return $plan;
        });

        return response()->json([
            'success' => true,
            'data' => $upgradePlansWithDiscount,
            'current_plan' => [
                'id' => $currentPlan->id,
                'name_en' => $currentPlan->name_en,
                'name_ar' => $currentPlan->name_ar,
                'slug' => $currentPlan->slug,
                'description_en' => $currentPlan->description_en,
                'description_ar' => $currentPlan->description_ar,
                'price' => $currentPlan->price,
                'months_count' => $currentPlan->months_count,
                'is_lifetime' => $currentPlan->is_lifetime,
                'readable_billing_cycle' => $currentPlan->readable_billing_cycle ?: $currentPlan->generateReadableBillingCycle(),
                'ad_limit' => $currentPlan->ad_limit,
                'featured_ads' => $currentPlan->featured_ads,
                'featured_ads_count' => $currentPlan->featured_ads_count,
                'has_unlimited_featured_ads' => $currentPlan->has_unlimited_featured_ads,
                'priority_support' => $currentPlan->priority_support,
                'analytics' => $currentPlan->analytics,
                'status' => $currentPlan->status
            ]
        ]);
    }

    /**
     * Get subscription plans
     */
    public function subscriptionPlans()
    {
        $plans = SubscriptionPlan::where('status', 'active')
            ->orderBy('price')
            ->get([
                'id',
                'name_en',
                'name_ar',
                'slug',
                'description_en',
                'description_ar',
                'price',
                'months_count',
                'is_lifetime',
                'readable_billing_cycle',
                'ad_limit',
                'featured_ads',
                'featured_ads_count',
                'has_unlimited_featured_ads',
                'priority_support',
                'analytics',
                'status'
            ]);

        // Generate readable billing cycle for plans that don't have it
        $plans->each(function ($plan) {
            if (empty($plan->readable_billing_cycle)) {
                $plan->readable_billing_cycle = $plan->generateReadableBillingCycle();
            }
        });

        return response()->json([
            'success' => true,
            'data' => $plans,
        ]);
    }

    /**
     * Get upgrade subscription plans with discounted pricing
     */
    public function getUpgradePlans(Request $request)
    {
        // User is already authenticated by the api.auth middleware
        $user = Auth::user();

        $currentPlanId = $request->get('current_plan_id');
        
        if (!$currentPlanId) {
            return response()->json([
                'success' => false,
                'message' => 'Current plan ID is required'
            ], 400);
        }

        // Get current subscription
        $currentSubscription = \App\Models\UserSubscription::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->with('subscriptionPlan')
            ->first();

        if (!$currentSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found'
            ], 404);
        }

        $currentPlan = $currentSubscription->subscriptionPlan;
        
        // Get plans with higher prices than current plan
        $upgradePlans = SubscriptionPlan::where('status', 'active')
            ->where('price', '>', $currentPlan->price)
            ->orderBy('price')
            ->get();

        // Calculate discounts for each plan
        $plansWithDiscounts = $upgradePlans->map(function ($plan) use ($currentSubscription, $currentPlan) {
            // If current plan is lifetime, no discount should be applied
            if ($currentPlan->is_lifetime) {
                return [
                    'id' => $plan->id,
                    'name_en' => $plan->name_en,
                    'name_ar' => $plan->name_ar,
                    'price' => $plan->price,
                    'months_count' => $plan->months_count,
                    'is_lifetime' => $plan->is_lifetime,
                    'remaining_days' => 0,
                    'is_current_lifetime' => true,
                ];
            }

            // Calculate remaining days as whole days (floor the decimal)
            $remainingDays = floor(now()->diffInDays($currentSubscription->expires_at, false));
            if ($remainingDays > 0) {
                // Step 1: Calculate remaining days (already done above)
                // Step 2: Calculate per day price using the subscription plan's duration (months)
                $planDurationInDays = $currentPlan->months_count * 30; // Convert months to days
                $currentPlanDailyRate = $currentPlan->price / $planDurationInDays; // Per day price
                
                // Step 3: Calculate discount amount
                $discountAmount = $currentPlanDailyRate * $remainingDays;
                
                
                // Calculate discounted price
                $discountedPrice = max($plan->price - $discountAmount, $plan->price * 0.1); // Min 10% of original price
                
                return [
                    'id' => $plan->id,
                    'name_en' => $plan->name_en,
                    'name_ar' => $plan->name_ar,
                    'price' => $plan->price,
                    'discounted_price' => round($discountedPrice, 2),
                    'discount_amount' => round($discountAmount, 2),
                    'original_price' => $plan->price,
                    'months_count' => $plan->months_count,
                    'is_lifetime' => $plan->is_lifetime,
                    'remaining_days' => $remainingDays,
                    'is_current_lifetime' => false,
                ];
            } else {
                // No discount if subscription is expired
                return [
                    'id' => $plan->id,
                    'name_en' => $plan->name_en,
                    'name_ar' => $plan->name_ar,
                    'price' => $plan->price,
                    'months_count' => $plan->months_count,
                    'is_lifetime' => $plan->is_lifetime,
                    'remaining_days' => 0,
                    'is_current_lifetime' => false,
                ];
            }
        });

        return response()->json([
            'success' => true,
            'data' => $plansWithDiscounts
        ]);
    }

    /**
     * Assign subscription to an ad
     */
    public function assignSubscription(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'subscription_plan_id' => 'required|exists:subscription_plans,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::guard('sanctum')->user();
        $ad = Ad::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Ad not found or unauthorized'
            ], 404);
        }

        $subscriptionPlan = SubscriptionPlan::findOrFail($request->subscription_plan_id);

        // Calculate expiry date based on subscription plan
        $expiresAt = $subscriptionPlan->is_lifetime 
            ? now()->addYears(100) // Set very far future date for lifetime subscriptions
            : now()->addMonths($subscriptionPlan->months_count);

        // Create a transaction record
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $subscriptionPlan->id,
            'transaction_id' => Transaction::generateTransactionId(),
            'type' => 'subscription',
            'amount' => $subscriptionPlan->price,
            'currency' => 'KWD',
            'payment_method' => 'manual',
            'status' => 'completed',
            'description' => "Subscription purchase for ad: {$ad->title_en}",
            'metadata' => [
                'ad_id' => $ad->id,
                'ad_title' => $ad->title_en,
                'subscription_type' => $subscriptionPlan->is_lifetime ? 'lifetime' : 'monthly',
                'months_count' => $subscriptionPlan->months_count,
            ],
            'processed_at' => now(),
        ]);

        // Create a new user subscription record
        $userSubscription = $user->subscriptions()->create([
            'subscription_plan_id' => $subscriptionPlan->id,
            'status' => 'active',
            'is_active' => true,
            'usable_ad_for_this_month' => $subscriptionPlan->ad_limit ?? 0,
            'last_allowance_reset' => now(),
            'starts_at' => now(),
            'expires_at' => $expiresAt,
            'amount_paid' => $subscriptionPlan->price,
            'payment_method' => 'manual', // For now, manual assignment
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription assigned successfully',
            'data' => [
                'ad' => $ad->load(['category', 'governorate', 'condition', 'priceType', 'images']),
                'subscription_plan' => $subscriptionPlan,
                'user_subscription' => $userSubscription,
                'transaction' => $transaction,
            ],
        ]);
    }

    /**
     * Upgrade user subscription
     */
    public function upgradeSubscription(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subscription_plan_id' => 'required|exists:subscription_plans,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::guard('sanctum')->user();
        $currentSubscription = $user->subscription;
        $newPlan = SubscriptionPlan::findOrFail($request->subscription_plan_id);

        if (!$currentSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found'
            ], 404);
        }

        // Check if it's actually an upgrade
        if ($newPlan->price <= $currentSubscription->plan->price || 
            $newPlan->ad_limit <= $currentSubscription->plan->ad_limit) {
            return response()->json([
                'success' => false,
                'message' => 'Selected plan is not an upgrade'
            ], 400);
        }

        // Calculate upgrade cost
        $upgradeCost = $this->calculatePlanDiscount($currentSubscription, $newPlan);

        // Calculate ad limit increase
        $adLimitIncrease = $newPlan->ad_limit - $currentSubscription->plan->ad_limit;
        
        // Calculate ads already used this month
        $adsUsedThisMonth = $currentSubscription->plan->ad_limit - $currentSubscription->usable_ad_for_this_month;
        
        // Calculate new allowance: new plan's ad limit minus ads already used
        $newAllowance = $newPlan->ad_limit;

        // Create transaction record
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $newPlan->id,
            'transaction_id' => Transaction::generateTransactionId(),
            'type' => 'upgrade',
            'amount' => $newPlan->price - $upgradeCost,
            'currency' => 'KWD',
            'payment_method' => 'manual',
            'status' => 'completed',
            'description' => "Subscription upgrade from {$currentSubscription->plan->name_en} to {$newPlan->name_en}",
            'metadata' => [
                'upgrade_cost' => $upgradeCost,
                'original_plan_price' => $currentSubscription->plan->price,
                'new_plan_price' => $newPlan->price,
                'ad_limit_increase' => $adLimitIncrease,
                'ads_used_this_month' => $adsUsedThisMonth,
                'new_allowance' => $newAllowance - 1,
                'subscription_type' => $newPlan->is_lifetime ? 'lifetime' : 'monthly',
                'months_count' => $newPlan->months_count,
            ],
            'processed_at' => now(),
        ]);

        // Update subscription
        $expiresAt = $newPlan->is_lifetime 
            ? now()->addYears(100) 
            : now()->addMonths($newPlan->months_count);

        $currentSubscription->update([
            'subscription_plan_id' => $newPlan->id,
            'expires_at' => $expiresAt,
            'amount_paid' => $newPlan->price,
            'payment_method' => 'manual',
            'usable_ad_for_this_month' => $newAllowance,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription upgraded successfully',
            'data' => [
                'user_subscription' => $currentSubscription->fresh(['plan']),
                'subscription_plan' => $newPlan,
                'transaction' => $transaction,
                'ad_limit_increase' => $adLimitIncrease,
                'ads_used_this_month' => $adsUsedThisMonth,
                'new_allowance' => $newAllowance,
            ],
        ]);
    }

    /**
     * Upgrade subscription from profile page
     */
    public function upgradeSubscriptionFromProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subscription_plan_id' => 'required|exists:subscription_plans,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::guard('sanctum')->user();
        $currentSubscription = $user->subscription;
        $newPlan = SubscriptionPlan::findOrFail($request->subscription_plan_id);

        if (!$currentSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found'
            ], 404);
        }

        // Check if it's actually an upgrade
        if ($newPlan->price <= $currentSubscription->plan->price) {
            return response()->json([
                'success' => false,
                'message' => 'Selected plan is not an upgrade'
            ], 400);
        }

        // Calculate upgrade cost
        $upgradeCost = $this->calculatePlanDiscount($currentSubscription, $newPlan);

        // Calculate ad limit increase
        $adLimitIncrease = $newPlan->ad_limit - $currentSubscription->plan->ad_limit;
        
        // Calculate ads already used this month
        $adsUsedThisMonth = $currentSubscription->plan->ad_limit - $currentSubscription->usable_ad_for_this_month;
        
        // Calculate new allowance: upgraded plan ad_limit - 1 (as per specification)
        $user_subscription = UserSubscription::where('status','active')->where('is_active',true)->where('user_id', $user->id)->first();
        $newAllowance =  $user_subscription->usable_ad_for_this_month + $newPlan->ad_limit;
        // Create transaction record
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $newPlan->id,
            'transaction_id' => Transaction::generateTransactionId(),
            'type' => 'upgrade',
            'amount' => $newPlan->price - $upgradeCost,
            'currency' => 'KWD',
            'payment_method' => 'manual',
            'status' => 'completed',
            'description' => "Subscription upgrade from {$currentSubscription->plan->name_en} to {$newPlan->name_en}",
            'metadata' => [
                'upgrade_cost' => $upgradeCost,
                'original_plan_price' => $currentSubscription->plan->price,
                'new_plan_price' => $newPlan->price,
                'ad_limit_increase' => $adLimitIncrease,
                'ads_used_this_month' => $adsUsedThisMonth,
                'new_allowance' => $newAllowance,
                'subscription_type' => $newPlan->is_lifetime ? 'lifetime' : 'monthly',
                'months_count' => $newPlan->months_count,
            ],
            'processed_at' => now(),
        ]);

        // Update subscription
        $expiresAt = $newPlan->is_lifetime 
            ? now()->addYears(100) 
            : now()->addMonths($newPlan->months_count);

        $currentSubscription->update([
            'subscription_plan_id' => $newPlan->id,
            'expires_at' => $expiresAt,
            'amount_paid' => $newPlan->price,
            'payment_method' => 'manual',
            'starts_at' => now(),
            'usable_ad_for_this_month' => $newAllowance,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription upgraded successfully',
            'data' => [
                'user_subscription' => $currentSubscription->fresh(['plan']),
                'subscription_plan' => $newPlan,
                'transaction' => $transaction,
                'ad_limit_increase' => $adLimitIncrease,
                'ads_used_this_month' => $adsUsedThisMonth,
                'new_allowance' => $newAllowance,
            ],
        ]);
    }

    /**
     * Calculate discount for a plan based on current subscription
     */
    private function calculatePlanDiscount($currentSubscription, $plan)
    {
        $currentPlan = $currentSubscription->plan;
        
        // If current plan is lifetime, no discount
        if ($currentPlan->is_lifetime) {
            return 0;
        }
        // Calculate months passed since subscription creation (assuming 30 days per month)
        $subscriptionStartDate = $currentSubscription->created_at;
        $today = now();
        
        // Calculate the difference in months
        $monthsPassed = abs(intval($today->diffInMonths($subscriptionStartDate)));
        if ($monthsPassed <= 0) {
            return 0;
        }

        // Calculate days passed assuming 30 days per month
        $daysPassed = $monthsPassed * 30;
        
        // Calculate current plan per day price
        $planDurationInDays = $currentPlan->months_count * 30;
        $currentPlanPerDayPrice = floatval($currentPlan->price) / floatval($planDurationInDays);
        
        // Calculate discount based on days passed
        $discount_in_days = floatval($daysPassed) * floatval($currentPlanPerDayPrice);
        $discount = min($discount_in_days, floatval($currentPlan->price)); // Don't exceed the original price
        // dd($daysPassed, $currentPlanPerDayPrice, $discount, $currentPlan->price,$discount_in_days);  
        return $discount;
    }

    /**
     * Delete an ad
     */
    public function destroy($id)
    {
        $ad = Ad::where('id', $id)
            ->where('user_id', Auth::guard('sanctum')->id())
            ->first();

        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Ad not found or you do not have permission to delete this ad',
            ], 404);
        }

        // Delete associated images from S3
        foreach ($ad->images as $image) {
            if ($image->path) {
                Storage::disk('s3')->delete($image->path);
            }
        }

        // Delete the ad (this will cascade delete images due to foreign key constraint)
        $ad->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ad deleted successfully',
        ]);
    }

    /**
     * Add product to favorites
     */
    public function addToFavorites(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        $ad = Ad::where('id', $id)
            ->where('status', 'active')
            ->where('is_approved', true)
            ->first();

        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Check if already favorited
        $existingFavorite = Favorite::where('user_id', $user->id)
            ->where('ad_id', $ad->id)
            ->first();

        if ($existingFavorite) {
            return response()->json([
                'success' => false,
                'message' => 'Product already in favorites'
            ], 400);
        }

        // Add to favorites
        Favorite::create([
            'user_id' => $user->id,
            'ad_id' => $ad->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product added to favorites'
        ]);
    }

    /**
     * Remove product from favorites
     */
    public function removeFromFavorites(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        $favorite = Favorite::where('user_id', $user->id)
            ->where('ad_id', $id)
            ->first();

        if (!$favorite) {
            return response()->json([
                'success' => false,
                'message' => 'Product not in favorites'
            ], 404);
        }

        $favorite->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product removed from favorites'
        ]);
    }

    /**
     * Get user's favorites
     */
    public function getFavorites(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        $favorites = Favorite::where('user_id', $user->id)
            ->with([
                'ad' => function ($query) {
                    $query->with([
                        'category:id,name_en,name_ar',
                        'governorate:id,name_en,name_ar',
                        'condition:id,name_en,name_ar',
                        'priceType:id,name_en,name_ar',
                        'primaryImage:id,ad_id,url,is_primary',
                        'user:id,name_en,name_ar,profile_picture_url'
                    ]);
                }
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $favorites
        ]);
    }

    /**
     * Check if product is favorited by user
     */
    public function checkFavorite(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json([
                'success' => true,
                'is_favorited' => false
            ]);
        }

        $isFavorited = Favorite::where('user_id', $user->id)
            ->where('ad_id', $id)
            ->exists();

        return response()->json([
            'success' => true,
            'is_favorited' => $isFavorited
        ]);
    }

    /**
     * Update the current step of a draft ad
     */
    public function updateCurrentStep(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'current_step' => 'required|integer|min:1|max:4',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::guard('sanctum')->user();
        $ad = Ad::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'draft')
            ->first();

        if (!$ad) {
            return response()->json([
                'success' => false,
                'message' => 'Draft ad not found'
            ], 404);
        }

        $ad->update([
            'current_step' => $request->current_step
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Current step updated successfully',
            'data' => [
                'ad_id' => $ad->id,
                'current_step' => $ad->current_step
            ]
        ]);
    }

    /**
     * Check if user has active subscription
     */
    private function userHasActiveSubscription($userId)
    {
        return \App\Models\UserSubscription::where('user_id', $userId)
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->exists();
    }

    /**
     * Get user's current subscription
     */
    public function getUserSubscription(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        $subscription = \App\Models\UserSubscription::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->with('subscriptionPlan')
            ->first();


        // This logic is incorrect. It should check if the subscription is expired (expires_at < now()), not the other way around.
        if (!$subscription) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'No active subscription found'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'is_active' => $subscription->is_active,
                'usable_ad_for_this_month' => $subscription->usable_ad_for_this_month,
                'expires_at' => $subscription->expires_at,
                'plan' => [
                    'id' => $subscription->subscriptionPlan->id,
                    'name_en' => $subscription->subscriptionPlan->name_en,
                    'name_ar' => $subscription->subscriptionPlan->name_ar,
                    'ad_limit' => $subscription->subscriptionPlan->ad_limit,
                    'price' => $subscription->subscriptionPlan->price,
                ]
            ]
        ]);
    }

    /**
     * Increment contact count for an ad
     */
    public function incrementContactCount(Request $request, $id)
    {
        try {
            $ad = Ad::findOrFail($id);
            
            // Increment the contact_count
            $ad->increment('contact_count');
            
            return response()->json([
                'success' => true,
                'message' => 'Contact count incremented successfully',
                'contact_count' => $ad->fresh()->contact_count
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to increment contact count',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign subscription to an ad (private helper method)
     */
    private function assignSubscriptionToAd($ad, $subscriptionPlanId)
    {
        $user = Auth::guard('sanctum')->user();
        $subscriptionPlan = SubscriptionPlan::findOrFail($subscriptionPlanId);

        // Check if user already has an active subscription
        $existingSubscription = $user->subscriptions()
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->first();

        if ($existingSubscription) {
            // User already has an active subscription, just deduct from allowance if needed
            if ($existingSubscription->canCreateAd()) {
                $existingSubscription->deductAdAllowance();
            }
            return;
        }

        // Calculate expiry date based on subscription plan
        $expiresAt = $subscriptionPlan->is_lifetime 
            ? now()->addYears(100) // Set very far future date for lifetime subscriptions
            : now()->addMonths($subscriptionPlan->months_count);

        // Create a transaction record
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $subscriptionPlan->id,
            'transaction_id' => Transaction::generateTransactionId(),
            'type' => 'subscription',
            'amount' => $subscriptionPlan->price,
            'currency' => 'KWD',
            'payment_method' => 'manual',
            'status' => 'completed',
            'description' => "New subscription purchase",
            'metadata' => [
                'ad_id' => $ad->id,
                'ad_title' => $ad->title_en,
                'subscription_type' => $subscriptionPlan->is_lifetime ? 'lifetime' : 'monthly',
                'months_count' => $subscriptionPlan->months_count,
            ],
            'processed_at' => now(),
        ]);

        // Create a new user subscription record
        $userSubscription = $user->subscriptions()->create([
            'subscription_plan_id' => $subscriptionPlan->id,
            'status' => 'active',
            'is_active' => true,
            'usable_ad_for_this_month' => $subscriptionPlan->ad_limit - 1, // Subtract 1 for current ad
            'last_allowance_reset' => now(),
            'starts_at' => now(),
            'expires_at' => $expiresAt,
            'amount_paid' => $subscriptionPlan->price,
            'payment_method' => 'manual',
        ]);
    }
}
