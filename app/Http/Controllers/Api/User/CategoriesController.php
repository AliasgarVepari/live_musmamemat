<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoriesController extends Controller
{
    /**
     * Get active categories
     */
    public function index(Request $request)
    {
        $query = Category::where('status', 'active');

        // Get home categories (sort_order 1-4) if requested
        if ($request->get('home_only')) {
            $query->whereIn('sort_order', [1, 2, 3, 4])->orderBy('sort_order');
        } else {
            $query->orderBy('sort_order')->orderBy('name_en');
        }

        $categories = $query->get([
            'id', 'name_en', 'name_ar', 'slug', 'icon_url', 'sort_order', 'status',
        ]);

        return response()->json([
            'categories' => $categories,
        ]);
    }
}
