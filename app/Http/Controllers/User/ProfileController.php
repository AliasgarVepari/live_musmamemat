<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the user profile page
     */
    public function index()
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Load user relationships
        $user->load([
            'governorate:id,name_en,name_ar',
            'subscription.plan',
            'ads' => function ($query) {
                $query->with([
                    'category:id,name_en,name_ar',
                    'condition:id,name_en,name_ar',
                    'priceType:id,name_en,name_ar',
                    'governorate:id,name_en,name_ar',
                    'primaryImage:id,ad_id,url,is_primary',
                ])
                    ->orderBy('created_at', 'desc')
                    ->limit(10);
            },
            'adViews' => function ($query) {
                $query->with('ad')
                    ->orderBy('created_at', 'desc')
                    ->limit(10);
            },
        ]);

        // Get user statistics
        $stats = [
            'active_listings' => $user->ads()->where('status', 'active')->count(),
            'total_sales' => $user->ads()->where('status', 'sold')->count(),
            'profile_views' => $user->profile_view_counts ?? 0,
            'wishlist_items' => 0, // We'll implement wishlist later
        ];

        // Get recent listings
        $recentListings = $user->ads()->with([
            'category:id,name_en,name_ar',
            'primaryImage:id,ad_id,url,is_primary',
        ])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get recent wishlist (placeholder for now)
        $recentWishlist = collect([]);

        // Get subscription plans for upgrade
        $subscriptionPlans = SubscriptionPlan::where('is_active', true)
            ->orderBy('price')
            ->get(['id', 'name_en', 'name_ar', 'price', 'months_count', 'is_lifetime']);

        // Get transaction history (placeholder for now)
        $transactions = collect([]);

        return Inertia::render('user/Profile', [
            'user' => $user,
            'stats' => $stats,
            'recentListings' => $recentListings,
            'recentWishlist' => $recentWishlist,
            'subscriptionPlans' => $subscriptionPlans,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Update user profile information
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'phone_whatsapp' => 'nullable|string|max:20',
            'bio_en' => 'nullable|string|max:1000',
            'bio_ar' => 'nullable|string|max:1000',
        ]);

        $user->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update user profile picture
     */
    public function updateAvatar(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->profile_picture_url) {
                // Delete from S3 or local storage
            }

            // Upload new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->update(['profile_picture_url' => $avatarPath]);
        }

        return back()->with('success', 'Profile picture updated successfully.');
    }

    /**
     * Get user's ads with pagination
     */
    public function getAds(Request $request)
    {
        $user = Auth::user();
        
        $ads = $user->ads()
            ->with([
                'category:id,name_en,name_ar',
                'condition:id,name_en,name_ar',
                'priceType:id,name_en,name_ar',
                'governorate:id,name_en,name_ar',
                'primaryImage:id,ad_id,url,is_primary',
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($ads);
    }

    /**
     * Get user's wishlist (placeholder)
     */
    public function getWishlist(Request $request)
    {
        // This will be implemented when we add wishlist functionality
        return response()->json([]);
    }

    /**
     * Upgrade subscription
     */
    public function upgradeSubscription(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
        ]);

        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);
        
        // Check if user is trying to downgrade
        if ($user->subscription && $user->subscription->plan) {
            if ($plan->price < $user->subscription->plan->price) {
                return back()->withErrors(['plan_id' => 'You cannot downgrade to a lower-priced plan.']);
            }
        }

        // Calculate upgrade cost
        $upgradeCost = $this->calculateUpgradeCost($user, $plan);

        // For now, just update the subscription (in real app, process payment)
        $user->subscription()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'subscription_plan_id' => $plan->id,
                'expires_at' => now()->addMonths($plan->months_count),
                'is_active' => true,
            ]
        );

        return back()->with('success', 'Subscription upgraded successfully.');
    }

    /**
     * Calculate upgrade cost
     */
    private function calculateUpgradeCost(User $user, SubscriptionPlan $newPlan)
    {
        if (!$user->subscription || !$user->subscription->plan) {
            return $newPlan->price;
        }

        $currentPlan = $user->subscription->plan;
        $remainingDays = now()->diffInDays($user->subscription->expires_at, false);
        
        if ($remainingDays <= 0) {
            return $newPlan->price;
        }

        $dailyRate = $currentPlan->price / 30; // Assuming monthly plans
        $remainingValue = $dailyRate * $remainingDays;
        
        return max(0, $newPlan->price - $remainingValue);
    }
}
