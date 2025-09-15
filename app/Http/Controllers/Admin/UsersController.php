<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSubscription;
use App\Models\Ad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['governorate', 'subscription', 'subscription.plan'])
            ->withCount(['ads', 'adViews']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('name_en', 'like', "%{$search}%")
                  ->orWhere('name_ar', 'like', "%{$search}%");
            });
        }

        // Filter by subscription status
        if ($request->filled('subscription_status')) {
            if ($request->subscription_status === 'subscribed') {
                $query->whereHas('subscription', function ($q) {
                    $q->where('is_active', true)
                      ->where('expires_at', '>', now());
                });
            } elseif ($request->subscription_status === 'expired') {
                $query->whereHas('subscription', function ($q) {
                    $q->where('is_active', true)
                      ->where('expires_at', '<=', now());
                });
            } elseif ($request->subscription_status === 'unsubscribed') {
                $query->whereDoesntHave('subscription')
                      ->orWhereHas('subscription', function ($q) {
                          $q->where('is_active', false);
                      });
            }
        }

        // Filter by account status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by governorate
        if ($request->filled('governorate_id')) {
            $query->where('governorate_id', $request->governorate_id);
        }

        // Get per_page parameter with validation
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [5, 10, 20, 50, 100]) ? (int)$perPage : 20;

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        // Get governorates for filter dropdown
        $governorates = \App\Models\Governorate::orderBy('name_en')->get();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'governorates' => $governorates,
            'filters' => $request->only(['search', 'subscription_status', 'status', 'governorate_id', 'per_page']),
        ]);
    }

    public function show(User $user)
    {
        $user->load([
            'governorate',
            'subscription.plan',
            'ads' => function ($query) {
                $query->with(['category', 'condition', 'priceType'])
                      ->orderBy('created_at', 'desc')
                      ->limit(10);
            },
            'adViews' => function ($query) {
                $query->with('ad')
                      ->orderBy('created_at', 'desc')
                      ->limit(10);
            }
        ]);

        // Get subscription history
        $subscriptionHistory = UserSubscription::where('user_id', $user->id)
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get total stats
        $totalAds = $user->ads()->count();
        $totalViews = $user->adViews()->count();
        $activeAds = $user->ads()->where('status', 'active')->count();

        return Inertia::render('admin/users/show', [
            'user' => $user,
            'subscriptionHistory' => $subscriptionHistory,
            'totalAds' => $totalAds,
            'totalViews' => $totalViews,
            'activeAds' => $activeAds,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'required|string|max:20',
            'governorate_id' => 'required|exists:governorates,id',
            'status' => 'required|in:active,suspended,deleted',
            'suspension_reason' => 'nullable|string|max:1000',
        ]);

        // If suspending, require suspension reason
        if ($request->status === 'suspended' && empty($request->suspension_reason)) {
            return back()->withErrors(['suspension_reason' => 'Suspension reason is required when suspending a user.']);
        }

        $user->update([
            'name_en' => $request->name_en,
            'name_ar' => $request->name_ar,
            'email' => $request->email,
            'phone' => $request->phone,
            'governorate_id' => $request->governorate_id,
            'status' => $request->status,
            'suspension_reason' => $request->suspension_reason,
        ]);

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $request = request();
        $request->validate([
            'deletion_reason' => 'required|string|max:1000',
        ]);

        // Soft delete the user
        $user->update([
            'status' => 'deleted',
            'deletion_reason' => $request->deletion_reason,
            'deleted_at' => now(),
        ]);

        return redirect()->route('users.index')
            ->with('success', 'User account deleted successfully.');
    }

    public function toggle(User $user)
    {
        $newStatus = $user->status === 'active' ? 'suspended' : 'active';
        
        $user->update([
            'status' => $newStatus,
            'suspension_reason' => $newStatus === 'suspended' ? 'Account suspended by admin' : null,
        ]);

        return back()->with('success', "User account {$newStatus} successfully.");
    }

    public function revokeSubscription(Request $request, User $user)
    {
        $request->validate([
            'revocation_reason' => 'required|string|max:1000',
        ]);

        // Revoke current subscription
        if ($user->subscription) {
            $user->subscription->update([
                'is_active' => false,
                'revoked_at' => now(),
                'revocation_reason' => $request->revocation_reason,
            ]);
        }

        return back()->with('success', 'User subscription revoked successfully.');
    }

    public function reactivate(User $user)
    {
        if ($user->status !== 'deleted') {
            return back()->withErrors(['user' => 'Only deleted users can be reactivated.']);
        }

        $user->update([
            'status' => 'active',
            'deletion_reason' => null,
        ]);

        return back()->with('success', 'User account reactivated successfully.');
    }

    public function getStats()
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'active')->count(),
            'suspended_users' => User::where('status', 'suspended')->count(),
            'subscribed_users' => User::whereHas('subscription', function ($q) {
                $q->where('is_active', true)
                  ->where('expires_at', '>', now());
            })->count(),
            'total_ads' => Ad::count(),
            'total_views' => DB::table('ad_views')->count(),
        ];

        return response()->json($stats);
    }
}
