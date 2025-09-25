<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\SubscriptionPlan;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the user profile page
     */
    public function index()
    {
        $user = Auth::guard('web')->user();
        
        if (!$user) {
            // For demo purposes, return a response indicating authentication is required
            // The frontend will handle showing the auth modal
            return Inertia::render('user/Profile', [
                'user' => null,
                'requiresAuth' => true,
                'ads' => [],
                'wishlist' => [],
                'subscriptionPlans' => [],
                'governorates' => [],
            ]);
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
            'active_listings' => $user->ads()->where('status', 'active')->where('is_approved', true)->count(),
            'total_sales' => $user->ads()->where('status', 'sold')->count(),
            'profile_views' => $user->profile_view_counts ?? 0,
            'wishlist_items' => $user->favorites()->count(),
        ];

        // Get recent listings with all necessary relationships for editing
        $recentListings = $user->ads()->with([
            'category:id,name_en,name_ar',
            'condition:id,name_en,name_ar',
            'priceType:id,name_en,name_ar',
            'governorate:id,name_en,name_ar',
            'primaryImage:id,ad_id,url,is_primary',
            'images:id,ad_id,url,is_primary',
        ])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Transform primary_image to primaryImage for frontend
        $recentListingsData = $recentListings->map(function ($ad) {
            $data = $ad->toArray();
            $data['primaryImage'] = $data['primary_image'] ?? null;
            unset($data['primary_image']);
            return $data;
        });

        // Get recent wishlist
        $recentWishlist = $user->favorites()
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
            ->limit(8)
            ->get()
            ->pluck('ad')
            ->filter(); // Remove null ads

        // Transform primary_image to primaryImage for frontend
        $recentWishlistData = $recentWishlist->map(function ($ad) {
            if ($ad) {
                $data = $ad->toArray();
                $data['primaryImage'] = $data['primary_image'] ?? null;
                unset($data['primary_image']);
                return $data;
            }
            return null;
        })->filter();

        // Get subscription plans for upgrade
        $subscriptionPlans = SubscriptionPlan::where('status', 'active')
            ->orderBy('price')
            ->get(['id', 'name_en', 'name_ar', 'price', 'months_count', 'is_lifetime']);

        // Get transaction history
        $transactions = Transaction::where('user_id', $user->id)
            ->with('subscriptionPlan:id,name_en,name_ar,price')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'description' => $transaction->description,
                    'amount' => $transaction->amount,
                    'date' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'status' => $transaction->status,
                    'payment_method' => $transaction->payment_method,
                    'subscription_plan' => $transaction->subscriptionPlan ? [
                        'name_en' => $transaction->subscriptionPlan->name_en,
                        'name_ar' => $transaction->subscriptionPlan->name_ar,
                        'price' => $transaction->subscriptionPlan->price,
                    ] : null,
                ];
            });
//         dd( $user,
//              $stats,
//             $recentListings,
//             $recentWishlist,
//              $subscriptionPlans,
//  $transactions,);
        return Inertia::render('user/Profile', [
            'user' => $user,
            'stats' => $stats,
            'recentListings' => $recentListingsData,
            'recentWishlist' => $recentWishlistData,
            'subscriptionPlans' => $subscriptionPlans,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Update user profile information
     */
    public function update(Request $request)
    {
        $user = Auth::guard('web')->user();
        
        $validated = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $user->id,
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
        $user = Auth::guard('web')->user();
        
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
        $user = Auth::guard('web')->user();
        
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

        // Transform the response data to use camelCase for primaryImage
        $responseData = $ads->toArray();
        if (isset($responseData['data'])) {
            foreach ($responseData['data'] as &$ad) {
                $ad['primaryImage'] = $ad['primary_image'] ?? null;
                unset($ad['primary_image']);
            }
        }

        return response()->json($responseData);
    }

    /**
     * Get user's wishlist
     */
    public function getWishlist(Request $request)
    {
        $user = Auth::guard('web')->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        $favorites = $user->favorites()
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

        // Transform the response data to use camelCase for primaryImage
        $responseData = $favorites->toArray();
        if (isset($responseData['data'])) {
            foreach ($responseData['data'] as &$favorite) {
                if (isset($favorite['ad']) && isset($favorite['ad']['primary_image'])) {
                    $favorite['ad']['primaryImage'] = $favorite['ad']['primary_image'];
                    unset($favorite['ad']['primary_image']);
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $responseData
        ]);
    }

    /**
     * Upgrade subscription
     */
    public function upgradeSubscription(Request $request)
    {
        $user = Auth::guard('web')->user();
        
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

        // Create a transaction record
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'transaction_id' => Transaction::generateTransactionId(),
            'type' => 'upgrade',
            'amount' => $upgradeCost,
            'currency' => 'KWD',
            'payment_method' => 'manual',
            'status' => 'completed',
            'description' => "Subscription upgrade to {$plan->name_en}",
            'metadata' => [
                'upgrade_cost' => $upgradeCost,
                'original_plan_price' => $user->subscription?->plan?->price ?? 0,
                'new_plan_price' => $plan->price,
                'subscription_type' => $plan->is_lifetime ? 'lifetime' : 'monthly',
                'months_count' => $plan->months_count,
            ],
            'processed_at' => now(),
        ]);

        // For now, just update the subscription (in real app, process payment)
        $user->subscription()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'subscription_plan_id' => $plan->id,
                'expires_at' => $plan->is_lifetime ? now()->addYears(100) : now()->addMonths($plan->months_count),
                'is_active' => true,
                'usable_ad_for_this_month' => $plan->ad_limit ?? 0,
                'last_allowance_reset' => now(),
                'amount_paid' => $upgradeCost,
                'payment_method' => 'manual',
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
        
        // If current plan is lifetime, no discount should be applied
        if ($currentPlan->is_lifetime) {
            return $newPlan->price;
        }
        
        $remainingDays = now()->diffInDays($user->subscription->expires_at, false);
        
        if ($remainingDays <= 0) {
            return $newPlan->price;
        }

        $dailyRate = $currentPlan->price / 30; // Assuming monthly plans
        $remainingValue = $dailyRate * $remainingDays;
        
        return max(0, $newPlan->price - $remainingValue);
    }

    /**
     * Delete an ad
     */
    public function deleteAd($id)
    {
        $user = Auth::guard('web')->user();
        
        if (!$user) {
            return redirect()->back()->with('error', 'User not authenticated');
        }

        $ad = Ad::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$ad) {
            return redirect()->back()->with('error', 'Ad not found or you do not have permission to delete this ad');
        }

        // Delete associated images from S3
        foreach ($ad->images as $image) {
            if ($image->path) {
                Storage::disk('s3')->delete($image->path);
            }
        }

        // Delete the ad (this will cascade delete images due to foreign key constraint)
        $ad->delete();

        return redirect()->back()->with('success', 'Ad deleted successfully');
    }

    /**
     * Update an ad
     */
    public function updateAd(Request $request, $id)
    {
        $user = Auth::guard('web')->user();
        
        if (!$user) {
            return redirect()->back()->with('error', 'User not authenticated');
        }

        $ad = Ad::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$ad) {
            return redirect()->back()->with('error', 'Ad not found or you do not have permission to update this ad');
        }

        // Check if this is a status update
        if ($request->has('status')) {
            // Validate status update
            $request->validate([
                'status' => 'required|in:active,expired,sold,inactive'
            ]);

            // Update only the status
            $ad->update([
                'status' => $request->status
            ]);

            return redirect()->back()->with('success', 'Ad status updated successfully');
        }

        // Validate the request for content updates
        $request->validate([
            'title_en' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description_en' => 'required|string',
            'description_ar' => 'required|string',
            'product_details_en' => 'nullable|string',
            'product_details_ar' => 'nullable|string',
            'condition_id' => 'required|exists:conditions,id',
            'governorate_id' => 'required|exists:governorates,id',
            'price' => 'required|numeric|min:0',
            'price_type_id' => 'required|exists:price_types,id',
            'is_negotiable' => 'boolean',
        ]);

        // Prepare update data
        $updateData = [
            'title_en' => $request->title_en,
            'title_ar' => $request->title_ar,
            'description_en' => $request->description_en,
            'description_ar' => $request->description_ar,
            'product_details_en' => $request->product_details_en,
            'product_details_ar' => $request->product_details_ar,
            'condition_id' => $request->condition_id,
            'governorate_id' => $request->governorate_id,
            'price' => $request->price,
            'price_type_id' => $request->price_type_id,
            'is_negotiable' => $request->boolean('is_negotiable', false),
            'slug' => Ad::generateSlug($request->title_en, $ad->id), // Regenerate slug
        ];

        // If is_approved is provided (for rejected ads being re-edited), update it
        if ($request->has('is_approved')) {
            $updateData['is_approved'] = $request->is_approved;
            $updateData['reject_reason'] = null; // Clear reject reason when resubmitting
        }

        // Update the ad
        $ad->update($updateData);

        // Handle image updates if provided
        if ($request->hasFile('images')) {
            // Delete old images from S3
            foreach ($ad->images as $image) {
                if ($image->path) {
                    Storage::disk('s3')->delete($image->path);
                }
            }
            
            // Delete old image records
            $ad->images()->delete();

            // Upload new images
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('ads/' . $ad->id, 's3');
                $url = Storage::disk('s3')->url($path);
                
                $ad->images()->create([
                    'filename' => $image->getClientOriginalName(),
                    'original_name' => $image->getClientOriginalName(),
                    'path' => $path,
                    'url' => $url,
                    'mime_type' => $image->getMimeType(),
                    'file_size' => $image->getSize(),
                    'is_primary' => $index === 0,
                ]);
            }
        } elseif ($request->has('clear_images') && $request->boolean('clear_images')) {
            // Handle case where user wants to remove all images
            foreach ($ad->images as $image) {
                if ($image->path) {
                    Storage::disk('s3')->delete($image->path);
                }
            }
            $ad->images()->delete();
        } elseif ($request->has('removed_images')) {
            // Handle case where user wants to remove specific images
            $removedImageIds = $request->input('removed_images', []);
            
            if (is_array($removedImageIds) && count($removedImageIds) > 0) {
                // Find and delete the specific images
                $imagesToDelete = $ad->images()->whereIn('id', $removedImageIds)->get();
                
                foreach ($imagesToDelete as $image) {
                    if ($image->path) {
                        Storage::disk('s3')->delete($image->path);
                    }
                }
                
                // Delete the image records
                $ad->images()->whereIn('id', $removedImageIds)->delete();
            }
        }

        return redirect()->back()->with('success', 'Ad updated successfully');
    }

    /**
     * Toggle featured status of an ad
     */
    public function toggleFeatured(Request $request, $id)
    {
        $user = Auth::guard('web')->user();
        
        if (!$user) {
            return redirect()->back()->with('error', 'User not authenticated');
        }

        $ad = Ad::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$ad) {
            return redirect()->back()->with('error', 'Ad not found or you do not have permission to update this ad');
        }elseif($ad->is_approved === false || $ad->is_approved === null) {
            return redirect()->back()->with('error', 'Ad is not approved or is pending approval');
        }

        // Check if user has an active subscription
        $subscription = \App\Models\UserSubscription::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->with('subscriptionPlan')
            ->first();

        if (!$subscription) {
            return redirect()->back()->with('error', 'You need an active subscription to feature ads');
        }

        $plan = $subscription->subscriptionPlan;
        
        // Debug logging
        \Log::info('Feature Ad Request', [
            'user_id' => $user->id,
            'ad_id' => $ad->id,
            'plan_name' => $plan->name_en,
            'featured_ads_limit' => $plan->featured_ads,
            'is_featured' => $ad->is_featured
        ]);
        
        // If trying to feature the ad
        if (!$ad->is_featured) {
            // Check if user has unlimited featured ads
            if ($plan->has_unlimited_featured_ads) {
                $ad->update(['is_featured' => true]);
                return redirect()->back()->with('success', 'Ad featured successfully');
            }

            // Check if plan allows any featured ads
            if ($plan->featured_ads <= 0) {
                return redirect()->back()->with('error', "Your current plan does not allow featured ads. Upgrade your subscription to feature ads.");
            }

            // Count current featured ads
            $currentFeaturedCount = Ad::where('user_id', $user->id)
                ->where('is_featured', true)
                ->count();

            // Check if user has reached the limit
            if ($currentFeaturedCount >= $plan->featured_ads) {
                return redirect()->back()->with('error', "You have reached your featured ads limit. You have used {$currentFeaturedCount} out of {$plan->featured_ads} featured ads. Upgrade your subscription to feature more ads.");
            }

            $ad->update(['is_featured' => true]);
            $remainingAds = $plan->featured_ads - ($currentFeaturedCount + 1);
            $message = "Ad featured successfully! You have {$remainingAds} featured ads remaining.";
            \Log::info('Feature Ad Success', ['message' => $message]);
            return redirect()->back()->with('success', $message);
        } else {
            // Unfeature the ad
            $ad->update(['is_featured' => false]);
            $currentFeaturedCount = Ad::where('user_id', $user->id)
                ->where('is_featured', true)
                ->count();
            $remainingAds = $plan->featured_ads - $currentFeaturedCount;
            return redirect()->back()->with('success', "Ad unfeatured successfully! You have {$remainingAds} featured ads remaining.");
        }
    }


    /**
     * Get paginated user listings
     */
    public function getListings(Request $request)
    {
        $user = Auth::guard('web')->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        $perPage = $request->get('per_page', 5);
        $page = $request->get('page', 1);

        $listings = $user->ads()->with([
            'category:id,name_en,name_ar',
            'condition:id,name_en,name_ar',
            'priceType:id,name_en,name_ar',
            'governorate:id,name_en,name_ar',
            'primaryImage:id,ad_id,url,is_primary',
            'images:id,ad_id,url,is_primary'
        ])
        ->orderBy('created_at', 'desc')
        ->paginate($perPage, ['*'], 'page', $page);

        // Transform the response data to use camelCase for primaryImage
        $responseData = $listings->toArray();
        if (isset($responseData['data'])) {
            foreach ($responseData['data'] as &$ad) {
                $ad['primaryImage'] = $ad['primary_image'] ?? null;
                unset($ad['primary_image']);
            }
        }

        return response()->json($responseData);
    }
}
