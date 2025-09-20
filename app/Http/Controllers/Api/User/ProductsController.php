<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Category;
use App\Models\Condition;
use App\Models\Governorate;
use App\Models\PriceType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductsController extends Controller
{
    public function index(Request $request)
    {
        $query = Ad::with(['category', 'condition', 'priceType', 'governorate', 'primaryImage', 'user'])
            ->where('status', 'active')
            ->where('is_approved', true);

        // Search
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                    ->orWhere('title_ar', 'like', "%{$search}%")
                    ->orWhere('description_en', 'like', "%{$search}%")
                    ->orWhere('description_ar', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category') && $request->get('category') !== 'all') {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->get('category'));
            });
        }

        // Governorate filter
        if ($request->filled('governorate_id') && $request->get('governorate_id') !== 'all') {
            $query->where('governorate_id', $request->get('governorate_id'));
        }

        // Condition filter
        if ($request->filled('condition_id') && $request->get('condition_id') !== 'all') {
            $query->where('condition_id', $request->get('condition_id'));
        }

        // Price type filter
        if ($request->filled('price_type_id') && $request->get('price_type_id') !== 'all') {
            $query->where('price_type_id', $request->get('price_type_id'));
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->get('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->get('max_price'));
        }

        // Negotiable filter
        if ($request->filled('is_negotiable') && $request->get('is_negotiable') !== 'all') {
            $query->where('is_negotiable', $request->get('is_negotiable') === 'true');
        }

        // Sorting
        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'price-high':
                $query->orderBy('price', 'desc');
                break;
            case 'price-low':
                $query->orderBy('price', 'asc');
                break;
            case 'popular':
                $query->orderBy('views_count', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Pagination
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [5, 10, 20, 50, 100]) ? (int) $perPage : 20;

        $products = $query->paginate($perPage)->withQueryString();

        // Get filter options
        $categories   = Category::where('status', 'active')->orderBy('sort_order')->orderBy('name_en')->get();
        $governorates = Governorate::where('is_active', true)->orderBy('name_en')->get();
        $conditions   = Condition::where('is_active', true)->orderBy('name_en')->get();
        $priceTypes   = PriceType::where('is_active', true)->orderBy('name_en')->get();

        return Inertia::render('user/ProductListing', [
            'products'     => $products,
            'categories'   => $categories,
            'governorates' => $governorates,
            'conditions'   => $conditions,
            'priceTypes'   => $priceTypes,
            'filters'      => $request->only(['search', 'category', 'governorate_id', 'condition_id', 'price_type_id', 'min_price', 'max_price', 'is_negotiable', 'sort', 'per_page']),
        ]);
    }

    public function show(Ad $product)
    {
        $product->load([
            'user:id,name_en,name_ar,email,phone,profile_picture_url',
            'category:id,name_en,name_ar',
            'priceType:id,name_en,name_ar',
            'condition:id,name_en,name_ar',
            'governorate:id,name_en,name_ar',
            'adImages:id,ad_id,url,is_primary,created_at',
            'views.user:id,name_en,name_ar',
        ]);

        // Increment view count
        $product->increment('views_count');

        return Inertia::render('user/ProductDetail', [
            'product' => $product,
        ]);
    }
}
