<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SubscriptionPlansController extends Controller
{
    public function index()
    {
        $plans = SubscriptionPlan::orderBy('created_at', 'desc')->get();

        return Inertia::render('admin/subscription-plans/index', [
            'plans' => $plans,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/subscription-plans/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'description_en' => 'required|string',
            'description_ar' => 'required|string',
            'price' => 'required|numeric|min:0',
            'months_count' => 'required|integer|min:0',
            'is_lifetime' => 'boolean',
            'ad_limit' => 'required|integer|min:0',
            'featured_ads' => 'required|integer|min:0',
            'has_unlimited_featured_ads' => 'boolean',
            'priority_support' => 'boolean',
            'analytics' => 'boolean',
            'status' => 'required|in:active,inactive,delete',
        ]);

        // Create a temporary plan instance to generate readable billing cycle
        $tempPlan = new SubscriptionPlan([
            'months_count' => $request->months_count,
            'is_lifetime' => $request->is_lifetime ?? false,
        ]);

        $plan = SubscriptionPlan::create([
            'name_en' => $request->name_en,
            'name_ar' => $request->name_ar,
            'slug' => Str::slug($request->name_en),
            'description_en' => $request->description_en,
            'description_ar' => $request->description_ar,
            'price' => $request->price,
            'months_count' => $request->months_count,
            'is_lifetime' => $request->is_lifetime ?? false,
            'readable_billing_cycle' => $tempPlan->generateReadableBillingCycle(),
            'ad_limit' => $request->ad_limit,
            'featured_ads' => $request->featured_ads,
            'featured_ads_count' => $request->has_unlimited_featured_ads ? 0 : $request->featured_ads,
            'has_unlimited_featured_ads' => $request->has_unlimited_featured_ads ?? false,
            'priority_support' => $request->priority_support ?? false,
            'analytics' => $request->analytics ?? false,
            'status' => $request->status,
        ]);

        return redirect()->route('subscription-plans.index')
            ->with('success', 'Subscription plan created successfully.');
    }

    public function show(SubscriptionPlan $subscriptionPlan)
    {
        $subscriptionPlan->load('userSubscriptions.user');
        
        return Inertia::render('admin/subscription-plans/show', [
            'plan' => $subscriptionPlan,
        ]);
    }

    public function edit(SubscriptionPlan $subscriptionPlan)
    {
        return Inertia::render('admin/subscription-plans/edit', [
            'plan' => $subscriptionPlan,
        ]);
    }

    public function update(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'description_en' => 'required|string',
            'description_ar' => 'required|string',
            'price' => 'required|numeric|min:0',
            'months_count' => 'required|integer|min:0',
            'is_lifetime' => 'boolean',
            'ad_limit' => 'required|integer|min:0',
            'featured_ads' => 'required|integer|min:0',
            'has_unlimited_featured_ads' => 'boolean',
            'priority_support' => 'boolean',
            'analytics' => 'boolean',
            'status' => 'required|in:active,inactive,delete',
        ]);

        // Create a temporary plan instance to generate readable billing cycle
        $tempPlan = new SubscriptionPlan([
            'months_count' => $request->months_count,
            'is_lifetime' => $request->is_lifetime ?? false,
        ]);

        $subscriptionPlan->update([
            'name_en' => $request->name_en,
            'name_ar' => $request->name_ar,
            'slug' => Str::slug($request->name_en),
            'description_en' => $request->description_en,
            'description_ar' => $request->description_ar,
            'price' => $request->price,
            'months_count' => $request->months_count,
            'is_lifetime' => $request->is_lifetime ?? false,
            'readable_billing_cycle' => $tempPlan->generateReadableBillingCycle(),
            'ad_limit' => $request->ad_limit,
            'featured_ads' => $request->featured_ads,
            'featured_ads_count' => $request->has_unlimited_featured_ads ? 0 : $request->featured_ads,
            'has_unlimited_featured_ads' => $request->has_unlimited_featured_ads ?? false,
            'priority_support' => $request->priority_support ?? false,
            'analytics' => $request->analytics ?? false,
            'status' => $request->status,
        ]);

        return redirect()->route('subscription-plans.index')
            ->with('success', 'Subscription plan updated successfully.');
    }

    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        // Check if there are active subscriptions
        $activeSubscriptions = $subscriptionPlan->userSubscriptions()
            ->where('is_active', true)
            ->count();

        if ($activeSubscriptions > 0) {
            return back()->withErrors([
                'plan' => "Cannot delete subscription plan. There are {$activeSubscriptions} active subscriptions. Please revoke all subscriptions first."
            ]);
        }

        $subscriptionPlan->delete();

        return redirect()->route('subscription-plans.index')
            ->with('success', 'Subscription plan deleted successfully.');
    }

    public function toggleStatus(SubscriptionPlan $subscriptionPlan)
    {
        $newStatus = $subscriptionPlan->status === 'active' ? 'inactive' : 'active';
        $subscriptionPlan->update(['status' => $newStatus]);

        $message = $newStatus === 'active' 
            ? 'Subscription plan activated successfully.' 
            : 'Subscription plan suspended successfully.';

        return back()->with('success', $message);
    }
}
