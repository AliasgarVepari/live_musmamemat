<?php
namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Category;
use App\Models\Condition;
use App\Models\Governorate;
use App\Models\PriceType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display product listing page
     */
    public function index(Request $request)
    {
        $query = Ad::where('status', 'active')
            ->where('is_approved', true)
            ->with(['category:id,name_en,name_ar,slug', 'governorate:id,name_en,name_ar', 'primaryImage', 'priceType:id,name_en,name_ar', 'condition:id,name_en,name_ar']);

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

        $products = $query->paginate($perPage)->withQueryString();

        // Transform the response data to use camelCase for primaryImage
        $responseData = $products->toArray();
        if (isset($responseData['data'])) {
            foreach ($responseData['data'] as &$product) {
                $product['primaryImage'] = $product['primary_image'] ?? null;
                unset($product['primary_image']);
            }
        }

        // Get filter options
        $categories = Category::where('status', 'active')
            ->orderBy('sort_order')
            ->orderBy('name_en')
            ->get(['id', 'name_en', 'name_ar', 'slug']);

        $governorates = Governorate::where('is_active', true)
            ->orderBy('name_en')
            ->get(['id', 'name_en', 'name_ar']);

        $conditions = Condition::where('is_active', true)
            ->orderBy('name_en')
            ->get(['id', 'name_en', 'name_ar']);

        $priceTypes = PriceType::where('is_active', true)
            ->orderBy('name_en')
            ->get(['id', 'name_en', 'name_ar']);

            // dd($products);

        return Inertia::render('user/ProductListing', [
            'products'     => $responseData,
            'categories'   => $categories,
            'governorates' => $governorates,
            'conditions'   => $conditions,
            'priceTypes'   => $priceTypes,
            'filters'      => $request->only([
                'category', 'search', 'type', 'governorate_id', 'condition_id',
                'price_type_id', 'min_price', 'max_price', 'is_negotiable', 'sort', 'per_page',
            ]),
        ]);
    }

    /**
     * Display product detail page
     */
    public function show(Request $request, $id)
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

        // Get selected category from query parameter
        $selectedCategory = null;
        if ($request->has('selected_category')) {
            $selectedCategory = \App\Models\Category::where('slug', $request->get('selected_category'))
                ->select('id', 'name_en', 'name_ar', 'slug')
                ->first();
        }

        // Get related products
        $relatedProducts = Ad::where('status', 'active')
            ->where('is_approved', true)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category:id,name_en,name_ar', 'governorate:id,name_en,name_ar', 'primaryImage'])
            ->limit(4)
            ->get();

        return Inertia::render('user/ProductDetail', [
            'product'         => $product,
            'selectedCategory' => $selectedCategory,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    /**
     * Handle product search from detail page
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');

        if (empty($query)) {
            return redirect()->route('user.products.index');
        }

        return redirect()->route('user.products.index', ['search' => $query]);
    }
}
