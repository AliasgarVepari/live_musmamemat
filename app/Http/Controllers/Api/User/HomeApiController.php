<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Banner;
use App\Models\Category;
use App\Models\SocialLink;
use Illuminate\Http\Request;

class HomeApiController extends Controller
{
    /**
     * Get home page data
     */
    public function index()
    {
        // Get active banners for top and bottom positions
        $topBanners = Banner::where('status', 'active')
            ->where('position', 'top')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'image_url_en', 'image_url_ar', 'position', 'status', 'created_at']);

        $bottomBanners = Banner::where('status', 'active')
            ->where('position', 'bottom')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'image_url_en', 'image_url_ar', 'position', 'status', 'created_at']);

        // Get categories with sort order 1-4 for home page
        $homeCategories = Category::where('status', 'active')
            ->whereIn('sort_order', [1, 2, 3, 4])
            ->orderBy('sort_order')
            ->get(['id', 'name_en', 'name_ar', 'slug', 'icon_url', 'sort_order']);

        // Get social links
        $socialLinks = SocialLink::where('is_active', true)
            ->orderBy('created_at')
            ->get(['platform', 'url']);

        // Get recent ads for featured section
        $featuredAds = Ad::where('status', 'active')
            ->where('is_approved', true)
            ->where('is_featured', true)
            ->with(['category:id,name_en,name_ar', 'governorate:id,name_en,name_ar', 'primaryImage'])
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        return response()->json([
            'topBanners'     => $topBanners,
            'bottomBanners'  => $bottomBanners,
            'homeCategories' => $homeCategories,
            'socialLinks'    => $socialLinks,
            'featuredAds'    => $featuredAds,
        ]);
    }

    /**
     * Get banners by position
     */
    public function banners(Request $request)
    {
        $query = Banner::where('status', 'active');

        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        $banners = $query->orderBy('created_at', 'desc')
            ->get(['id', 'image_url_en', 'image_url_ar', 'position', 'status', 'created_at']);

        return response()->json($banners);
    }

    /**
     * Get featured ads
     */
    public function featuredAds(Request $request)
    {
        $limit = $request->get('limit', 8);
        $limit = min(max((int) $limit, 1), 20); // Between 1 and 20

        $featuredAds = Ad::where('status', 'active')
            ->where('is_approved', true)
            ->where('is_featured', true)
            ->with(['category:id,name_en,name_ar', 'governorate:id,name_en,name_ar', 'primaryImage'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($featuredAds);
    }

    /**
     * Get social links
     */
    public function socialLinks()
    {
        $socialLinks = SocialLink::where('is_active', true)
            ->orderBy('created_at')
            ->get(['platform', 'url']);

        return response()->json($socialLinks);
    }

    /**
     * Get categories for home page
     */
    public function categories()
    {
        $categories = Category::where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('name_en')
            ->get(['id', 'name_en', 'name_ar', 'slug', 'icon_url', 'sort_order']);

        return response()->json($categories);
    }
}
