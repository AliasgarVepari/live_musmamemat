<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AdminUser;
use App\Models\Ad;
use App\Models\Banner;
use App\Models\UserSubscription;
use App\Models\SocialLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Get current date ranges
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();

        // User Statistics
        $totalUsers = User::count();
        $newUsersToday = User::whereDate('created_at', $today)->count();
        $newUsersThisMonth = User::where('created_at', '>=', $thisMonth)->count();
        $activeUsers = User::where('is_subscribed', true)->count();

        // Ad Statistics
        $totalAds = Ad::count();
        $pendingAds = Ad::where('status', 'draft')->count();
        $approvedAds = Ad::where('status', 'active')->count();
        $rejectedAds = Ad::where('status', 'inactive')->count();
        $featuredAds = Ad::where('is_featured', true)->count();
        $adsThisMonth = Ad::where('created_at', '>=', $thisMonth)->count();

        // Revenue Statistics
        $totalRevenue = UserSubscription::where('status', 'active')->sum('amount_paid') ?? 0;
        $monthlyRevenue = UserSubscription::where('status', 'active')
            ->where('created_at', '>=', $thisMonth)
            ->sum('amount_paid') ?? 0;
        $lastMonthRevenue = UserSubscription::where('status', 'active')
            ->whereBetween('created_at', [$lastMonth, $thisMonth])
            ->sum('amount_paid') ?? 0;

        // Banner Statistics
        $totalBanners = Banner::count();
        $activeBanners = Banner::where('status', 'active')->count();

        // Social Links Statistics
        $totalSocialLinks = SocialLink::count();
        $activeSocialLinks = SocialLink::where('is_active', true)->count();

        // Recent Activity
        $recentAds = Ad::with(['user', 'category'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'title' => $ad->title_en,
                    'user_name' => $ad->user->email ?? 'Unknown',
                    'category' => $ad->category->name_en ?? 'Uncategorized',
                    'status' => $ad->status,
                    'created_at' => $ad->created_at->diffForHumans(),
                    'price' => $ad->price,
                ];
            });

        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'is_subscribed' => $user->is_subscribed,
                    'created_at' => $user->created_at->diffForHumans(),
                    'ads_count' => $user->ads_count ?? 0,
                ];
            });

        // Monthly Ad Trends (last 6 months)
        $adTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $adTrends[] = [
                'month' => $month->format('M Y'),
                'ads' => Ad::whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count(),
                'users' => User::whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count(),
            ];
        }

        // Top Categories
        $topCategories = DB::table('ads')
            ->join('categories', 'ads.category_id', '=', 'categories.id')
            ->select('categories.name_en as name', DB::raw('count(*) as ads_count'))
            ->where('ads.status', 'active')
            ->groupBy('categories.id', 'categories.name_en')
            ->orderBy('ads_count', 'desc')
            ->limit(5)
            ->get()
            ->toArray();

        // Revenue Growth
        $revenueGrowth = $lastMonthRevenue > 0 
            ? (($monthlyRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 
            : 0;

        // User Growth
        $usersBeforeThisMonth = User::where('created_at', '<', $thisMonth)->count();
        $userGrowth = $usersBeforeThisMonth > 0 
            ? (($newUsersThisMonth - $usersBeforeThisMonth) / $usersBeforeThisMonth) * 100 
            : ($newUsersThisMonth > 0 ? 100 : 0);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'users' => [
                    'total' => $totalUsers,
                    'new_today' => $newUsersToday,
                    'new_this_month' => $newUsersThisMonth,
                    'active' => $activeUsers,
                    'growth' => round($userGrowth, 2),
                ],
                'ads' => [
                    'total' => $totalAds,
                    'pending' => $pendingAds,
                    'approved' => $approvedAds,
                    'rejected' => $rejectedAds,
                    'featured' => $featuredAds,
                    'this_month' => $adsThisMonth,
                ],
                'revenue' => [
                    'total' => $totalRevenue,
                    'monthly' => $monthlyRevenue,
                    'last_month' => $lastMonthRevenue,
                    'growth' => round($revenueGrowth, 2),
                ],
                'banners' => [
                    'total' => $totalBanners,
                    'active' => $activeBanners,
                ],
                'social_links' => [
                    'total' => $totalSocialLinks,
                    'active' => $activeSocialLinks,
                ],
            ],
            'recent_activity' => [
                'ads' => $recentAds,
                'users' => $recentUsers,
            ],
            'charts' => [
                'ad_trends' => $adTrends,
                'top_categories' => $topCategories,
            ],
        ]);
    }
}
