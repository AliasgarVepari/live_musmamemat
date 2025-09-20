<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Category;
use App\Models\Condition;
use App\Models\Governorate;
use App\Models\PriceType;
use Illuminate\Http\Request;

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
        $perPage = in_array($perPage, [12, 24, 48]) ? $perPage : 20;

        $products = $query->paginate($perPage);

        return response()->json($products);
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

        return response()->json([
            'product'         => $product,
            'relatedProducts' => $relatedProducts,
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
}
