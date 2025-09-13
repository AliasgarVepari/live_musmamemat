<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SocialLink;
use App\Models\Governorate;
use App\Models\Condition;
use App\Models\PriceType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MasterModuleController extends Controller
{
    /**
     * Display the master module dashboard
     */
    public function index(): Response
    {
        // Get counts for each module
        $socialLinksCount = SocialLink::count();
        $governoratesCount = Governorate::count();
        $conditionsCount = Condition::count();
        $priceTypesCount = PriceType::count();

        // Get recent activity
        $recentSocialLinks = SocialLink::with('linkable')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentGovernorates = Governorate::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentConditions = Condition::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentPriceTypes = PriceType::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('admin/master-module/index', [
            'stats' => [
                'social_links' => $socialLinksCount,
                'governorates' => $governoratesCount,
                'conditions' => $conditionsCount,
                'price_types' => $priceTypesCount,
            ],
            'recent_activity' => [
                'social_links' => $recentSocialLinks,
                'governorates' => $recentGovernorates,
                'conditions' => $recentConditions,
                'price_types' => $recentPriceTypes,
            ]
        ]);
    }
}