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
use App\FuzzySearch;

class AdController extends Controller
{
    use FuzzySearch;
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

        // Fuzzy search functionality
        if ($request->filled('search')) {
            $searchFields = ['title_en', 'title_ar', 'description_en', 'description_ar'];
            $relationFields = [
                // 'user' => ['name_en', 'name_ar', 'email']
            ];
            
            $this->applyFuzzySearch($query, $request->search, $searchFields, $relationFields);
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
            if ($request->is_approved === 'pending') {
                $query->whereNull('is_approved');
            } else {
                $query->where('is_approved', $request->is_approved === 'true');
            }
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

        $data = [
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
        ];

        // Return JSON for API requests (not Inertia)
        // dd($request->headers->all());
        if (!$request->header('X-Inertia') && $request->header('J-Json')) {
            return response()->json(['ads' => $ads]);
        }

        return Inertia::render('admin/ads/index', $data);
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

    public function toggleStatus(Request $request, Ad $ad)
    {
        if (!$ad->canBeActivated() && !$ad->canBeDeactivated()) {
            $message = 'This ad cannot be activated/deactivated in its current state.';
            
            // Check if it's an API request (not Inertia)
            if (!$request->header('X-Inertia') && $request->header('J-Json')) {
                return response()->json(['success' => false, 'message' => $message], 400);
            }
            
            return back()->with('error', $message);
        }

        // Handle different status transitions
        if ($ad->status === 'expired') {
            $ad->update(['status' => 'active']);
            $message = 'Ad activated successfully.';
        } elseif ($ad->status === 'inactive') {
            $ad->update(['status' => 'active']);
            $message = 'Ad activated successfully.';
        } elseif ($ad->status === 'delete') {
            $ad->update(['status' => 'active']);
            $message = 'Ad activated successfully.';
        } elseif ($ad->status === 'active') {
            $ad->update(['status' => 'inactive']);
            $message = 'Ad deactivated successfully.';
        } else {
            $message = 'Invalid status transition.';
            
            // Check if it's an API request (not Inertia)
            if (!$request->header('X-Inertia') && $request->header('J-Json')) {
                return response()->json(['success' => false, 'message' => $message], 400);
            }
            
            return back()->with('error', $message);
        }

        // Check if it's an API request (not Inertia)
        if (!$request->header('X-Inertia') && $request->header('J-Json')) {
            return response()->json(['success' => true, 'message' => $message]);
        }

        return back()->with('success', $message);
    }

    public function approve(Request $request, Ad $ad)
    {
        if (!$ad->canBeApproved()) {
            $message = 'This ad cannot be approved in its current state.';
            
            // Check if it's an API request (not Inertia)
            if (!$request->header('X-Inertia') && $request->header('J-Json')) {
                return response()->json(['success' => false, 'message' => $message], 400);
            }
            
            return back()->with('error', $message);
        }

        $ad->update([
            'is_approved' => true,
            'reject_reason' => null // Clear any previous rejection reason
        ]);

        $message = 'Ad approved successfully.';
        
        // Check if it's an API request (not Inertia)
        if (!$request->header('X-Inertia') && $request->header('J-Json')) {
            return response()->json(['success' => true, 'message' => $message]);
        }

        return back()->with('success', $message);
    }

    public function reject(Request $request, Ad $ad)
    {
        if (!$ad->canBeRejected()) {
            $message = 'This ad cannot be rejected in its current state.';
            
            // Check if it's an API request (not Inertia)
            if (!$request->header('X-Inertia') && $request->header('J-Json')) {
                return response()->json(['success' => false, 'message' => $message], 400);
            }
            
            return back()->with('error', $message);
        }

        $request->validate([
            'reject_reason' => 'required|string|max:1000'
        ]);

        $ad->update([
            'is_approved' => false,
            'reject_reason' => $request->reject_reason
        ]);

        $message = 'Ad rejected successfully.';
        
        // Check if it's an API request (not Inertia)
        if (!$request->header('X-Inertia') && $request->header('J-Json')) {
            return response()->json(['success' => true, 'message' => $message]);
        }

        return back()->with('success', $message);
    }

    public function markAsSold(Request $request, Ad $ad)
    {
        if (!$ad->canBeMarkedAsSold()) {
            $message = 'This ad cannot be marked as sold in its current state.';
            
            // Check if it's an API request (not Inertia)
            if (!$request->header('X-Inertia') && $request->header('J-Json')) {
                return response()->json(['success' => false, 'message' => $message], 400);
            }
            
            return back()->with('error', $message);
        }

        $ad->update(['status' => 'sold']);

        $message = 'Ad marked as sold successfully.';
        
        // Check if it's an API request (not Inertia)
        if (!$request->header('X-Inertia') && $request->header('J-Json')) {
            return response()->json(['success' => true, 'message' => $message]);
        }

        return back()->with('success', $message);
    }

    public function markAsExpired(Request $request, Ad $ad)
    {
        if (!$ad->canBeMarkedAsExpired()) {
            $message = 'This ad cannot be marked as expired in its current state.';
            
            // Check if it's an API request (not Inertia)
            if (!$request->header('X-Inertia') && $request->header('J-Json')) {
                return response()->json(['success' => false, 'message' => $message], 400);
            }
            
            return back()->with('error', $message);
        }

        $ad->update(['status' => 'expired']);

        $message = 'Ad marked as expired successfully.';
        
        // Check if it's an API request (not Inertia)
        if (!$request->header('X-Inertia') && $request->header('J-Json')) {
            return response()->json(['success' => true, 'message' => $message]);
        }

        return back()->with('success', $message);
    }

    public function markAsInactive(Request $request, Ad $ad)
    {
        if (!$ad->canBeMarkedAsInactive()) {
            $message = 'This ad cannot be marked as inactive in its current state.';
            
            // Check if it's an API request (not Inertia)
            if (!$request->header('X-Inertia') && $request->header('J-Json')) {
                return response()->json(['success' => false, 'message' => $message], 400);
            }
            
            return back()->with('error', $message);
        }

        $request->validate([
            'inactive_reason' => 'required|string|max:1000'
        ]);

        $ad->update([
            'status' => 'inactive',
            'delete_reason' => $request->inactive_reason
        ]);

        $message = 'Ad marked as inactive successfully.';
        
        // Check if it's an API request (not Inertia)
        if (!$request->header('X-Inertia') && $request->header('J-Json')) {
            return response()->json(['success' => true, 'message' => $message]);
        }

        return back()->with('success', $message);
    }

    public function delete(Request $request, Ad $ad)
    {
        if (!$ad->canBeDeleted()) {
            return back()->with('error', 'This ad cannot be deleted in its current state.');
        }

        $request->validate([
            'delete_reason' => 'required|string|max:1000'
        ]);

        $ad->update([
            'status' => 'delete',
            'delete_reason' => $request->delete_reason
        ]);

        return back()->with('success', 'Ad deleted successfully.');
    }
}