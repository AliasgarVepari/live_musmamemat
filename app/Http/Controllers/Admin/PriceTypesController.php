<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PriceType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PriceTypesController extends Controller
{
    /**
     * Display a listing of price types
     */
    public function index(Request $request): Response
    {
        $query = PriceType::orderBy('name_en');

        // Filter by status if provided
        if ($request->has('status') && $request->status !== '') {
            $query->where('is_active', $request->status === 'active');
        }

        $priceTypes = $query->paginate(20);

        return Inertia::render('admin/master-module/price-types/index', [
            'priceTypes' => $priceTypes,
            'filters' => [
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new price type
     */
    public function create(): Response
    {
        return Inertia::render('admin/master-module/price-types/create');
    }

    /**
     * Store a newly created price type
     */
    public function store(Request $request)
    {
        $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Generate slug from English name
        $slug = \Str::slug($request->name_en);

        // Check if slug already exists
        if (PriceType::where('slug', $slug)->exists()) {
            return back()->withErrors(['name_en' => 'A price type with this name already exists.']);
        }

        try {
            PriceType::create([
                'name_en' => $request->name_en,
                'name_ar' => $request->name_ar,
                'slug' => $slug,
                'is_active' => $request->boolean('is_active', true),
            ]);

            return redirect()->route('price-types.index')
                ->with('success', 'Price type created successfully.');
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23505) { // Unique constraint violation
                return back()->withErrors(['name_en' => 'A price type with this name already exists.']);
            }
            throw $e;
        }
    }

    /**
     * Show the form for editing a price type
     */
    public function edit(PriceType $priceType): Response
    {
        return Inertia::render('admin/master-module/price-types/edit', [
            'priceType' => $priceType,
        ]);
    }

    /**
     * Update the specified price type
     */
    public function update(Request $request, PriceType $priceType)
    {
        $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Generate slug from English name
        $slug = \Str::slug($request->name_en);

        $priceType->update([
            'name_en' => $request->name_en,
            'name_ar' => $request->name_ar,
            'slug' => $slug,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('price-types.index')
            ->with('success', 'Price type updated successfully.');
    }

    /**
     * Remove the specified price type
     */
    public function destroy(PriceType $priceType)
    {
        // Check if price type is being used by ads
        if ($priceType->ads()->count() > 0) {
            return back()->withErrors(['price_type' => 'Cannot delete price type that is being used by ads.']);
        }

        $priceType->delete();

        return redirect()->route('price-types.index')
            ->with('success', 'Price type deleted successfully.');
    }

    /**
     * Toggle the active status of a price type
     */
    public function toggle(PriceType $priceType)
    {
        $priceType->update(['is_active' => !$priceType->is_active]);

        return back()->with('success', 'Price type status updated successfully.');
    }
}