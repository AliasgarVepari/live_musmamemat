<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Category;
use App\Models\Condition;
use App\Models\Governorate;
use App\Models\PriceType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdController extends Controller
{
    public function index(Request $request)
    {
        $query = Ad::with([
            'user:id,name_en,name_ar,email,phone',
            'category:id,name_en,name_ar',
            'priceType:id,name_en,name_ar',
            'condition:id,name_en,name_ar',
            'governorate:id,name_en,name_ar',
            'primaryImage:id,ad_id,url,is_primary'
        ]);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title_en', 'like', "%{$search}%")
                  ->orWhere('title_ar', 'like', "%{$search}%")
                  ->orWhere('description_en', 'like', "%{$search}%")
                  ->orWhere('description_ar', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name_en', 'like', "%{$search}%")
                               ->orWhere('name_ar', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by governorate
        if ($request->filled('governorate_id')) {
            $query->where('governorate_id', $request->governorate_id);
        }

        // Filter by price type
        if ($request->filled('price_type_id')) {
            $query->where('price_type_id', $request->price_type_id);
        }

        // Filter by condition
        if ($request->filled('condition_id')) {
            $query->where('condition_id', $request->condition_id);
        }

        // Filter by featured status
        if ($request->filled('is_featured')) {
            $query->where('is_featured', $request->is_featured === 'true');
        }

        // Filter by approval status
        if ($request->filled('is_approved')) {
            $query->where('is_approved', $request->is_approved === 'true');
        }

        // Filter by negotiable status
        if ($request->filled('is_negotiable')) {
            $query->where('is_negotiable', $request->is_negotiable === 'true');
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Get per_page parameter with validation
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [5, 10, 20, 50, 100]) ? (int)$perPage : 20;

        $ads = $query->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        // Get filter options
        $categories = Category::select('id', 'name_en', 'name_ar')->orderBy('name_en')->get();
        $governorates = Governorate::select('id', 'name_en', 'name_ar')->orderBy('name_en')->get();
        $priceTypes = PriceType::select('id', 'name_en', 'name_ar')->orderBy('name_en')->get();
        $conditions = Condition::select('id', 'name_en', 'name_ar')->orderBy('name_en')->get();

        return Inertia::render('admin/ads/index', [
            'ads' => $ads,
            'categories' => $categories,
            'governorates' => $governorates,
            'priceTypes' => $priceTypes,
            'conditions' => $conditions,
            'filters' => $request->only([
                'search', 'status', 'category_id', 'governorate_id', 
                'price_type_id', 'condition_id', 'is_featured', 
                'is_approved', 'is_negotiable', 'min_price', 'max_price', 'per_page'
            ]),
        ]);
    }

    public function show(Ad $ad)
    {
        $ad->load([
            'user:id,name_en,name_ar,email,phone,profile_picture_url',
            'category:id,name_en,name_ar',
            'priceType:id,name_en,name_ar',
            'condition:id,name_en,name_ar',
            'governorate:id,name_en,name_ar',
            'adImages:id,ad_id,url,is_primary,created_at',
            'views.user:id,name_en,name_ar'
        ]);

        return Inertia::render('admin/ads/show', [
            'ad' => $ad,
        ]);
    }

    public function edit(Ad $ad)
    {
        $ad->load([
            'user:id,name_en,name_ar,email',
            'category:id,name_en,name_ar',
            'priceType:id,name_en,name_ar',
            'condition:id,name_en,name_ar',
            'governorate:id,name_en,name_ar',
            'adImages:id,ad_id,url,is_primary'
        ]);

        // Get filter options for edit form
        $categories = Category::select('id', 'name_en', 'name_ar')->orderBy('name_en')->get();
        $governorates = Governorate::select('id', 'name_en', 'name_ar')->orderBy('name_en')->get();
        $priceTypes = PriceType::select('id', 'name_en', 'name_ar')->orderBy('name_en')->get();
        $conditions = Condition::select('id', 'name_en', 'name_ar')->orderBy('name_en')->get();

        return Inertia::render('admin/ads/edit', [
            'ad' => $ad,
            'categories' => $categories,
            'governorates' => $governorates,
            'priceTypes' => $priceTypes,
            'conditions' => $conditions,
        ]);
    }

    public function update(Request $request, Ad $ad)
    {
        $request->validate([
            'title_en' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description_en' => 'required|string',
            'description_ar' => 'required|string',
            'product_details_en' => 'nullable|string',
            'product_details_ar' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'price_type_id' => 'required|exists:price_types,id',
            'condition_id' => 'required|exists:conditions,id',
            'governorate_id' => 'required|exists:governorates,id',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|in:draft,active,inactive,expired,sold,delete',
            'is_featured' => 'boolean',
            'is_negotiable' => 'boolean',
            'is_approved' => 'boolean',
            'delete_reason' => 'nullable|string|max:500',
        ]);

        $ad->update([
            'title_en' => $request->title_en,
            'title_ar' => $request->title_ar,
            'description_en' => $request->description_en,
            'description_ar' => $request->description_ar,
            'product_details_en' => $request->product_details_en,
            'product_details_ar' => $request->product_details_ar,
            'price' => $request->price,
            'price_type_id' => $request->price_type_id,
            'condition_id' => $request->condition_id,
            'governorate_id' => $request->governorate_id,
            'category_id' => $request->category_id,
            'status' => $request->status,
            'is_featured' => $request->is_featured ?? false,
            'is_negotiable' => $request->is_negotiable ?? false,
            'is_approved' => $request->is_approved ?? false,
            'delete_reason' => $request->delete_reason,
        ]);

        return redirect()->route('ads.index')
            ->with('success', 'Ad updated successfully.');
    }

    public function destroy(Ad $ad)
    {
        $ad->delete();

        return redirect()->route('ads.index')
            ->with('success', 'Ad deleted successfully.');
    }

    public function toggleStatus(Ad $ad)
    {
        $newStatus = $ad->status === 'active' ? 'inactive' : 'active';
        $ad->update(['status' => $newStatus]);

        $message = $newStatus === 'active'
            ? 'Ad activated successfully.'
            : 'Ad deactivated successfully.';

        return back()->with('success', $message);
    }

    public function toggleFeatured(Ad $ad)
    {
        $ad->update(['is_featured' => !$ad->is_featured]);

        $message = $ad->is_featured
            ? 'Ad featured successfully.'
            : 'Ad unfeatured successfully.';

        return back()->with('success', $message);
    }

    public function toggleApproval(Ad $ad)
    {
        $ad->update(['is_approved' => !$ad->is_approved]);

        $message = $ad->is_approved
            ? 'Ad approved successfully.'
            : 'Ad unapproved successfully.';

        return back()->with('success', $message);
    }
}