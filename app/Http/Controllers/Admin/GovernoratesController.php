<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Governorate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GovernoratesController extends Controller
{
    /**
     * Display a listing of governorates
     */
    public function index(Request $request): Response
    {
        $query = Governorate::orderBy('name_en');

        // Filter by status if provided
        if ($request->has('status') && $request->status !== '') {
            $query->where('is_active', $request->status === 'active');
        }

        $governorates = $query->paginate(20);

        return Inertia::render('admin/master-module/governorates/index', [
            'governorates' => $governorates,
            'filters' => [
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new governorate
     */
    public function create(): Response
    {
        return Inertia::render('admin/master-module/governorates/create');
    }

    /**
     * Store a newly created governorate
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
        if (Governorate::where('slug', $slug)->exists()) {
            return back()->withErrors(['name_en' => 'A governorate with this name already exists.']);
        }

        try {
            Governorate::create([
                'name_en' => $request->name_en,
                'name_ar' => $request->name_ar,
                'slug' => $slug,
                'is_active' => $request->boolean('is_active', true),
            ]);

            return redirect()->route('governorates.index')
                ->with('success', 'Governorate created successfully.');
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23505) { // Unique constraint violation
                return back()->withErrors(['name_en' => 'A governorate with this name already exists.']);
            }
            throw $e;
        }
    }

    /**
     * Show the form for editing a governorate
     */
    public function edit(Governorate $governorate): Response
    {
        return Inertia::render('admin/master-module/governorates/edit', [
            'governorate' => $governorate,
        ]);
    }

    /**
     * Update the specified governorate
     */
    public function update(Request $request, Governorate $governorate)
    {
        $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Generate slug from English name
        $slug = \Str::slug($request->name_en);

        $governorate->update([
            'name_en' => $request->name_en,
            'name_ar' => $request->name_ar,
            'slug' => $slug,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('governorates.index')
            ->with('success', 'Governorate updated successfully.');
    }

    /**
     * Remove the specified governorate
     */
    public function destroy(Governorate $governorate)
    {
        // Check if governorate is being used by ads or users
        if ($governorate->ads()->count() > 0 || $governorate->users()->count() > 0) {
            return back()->withErrors(['governorate' => 'Cannot delete governorate that is being used by ads or users.']);
        }

        $governorate->delete();

        return redirect()->route('governorates.index')
            ->with('success', 'Governorate deleted successfully.');
    }

    /**
     * Toggle the active status of a governorate
     */
    public function toggle(Governorate $governorate)
    {
        $governorate->update(['is_active' => !$governorate->is_active]);

        return back()->with('success', 'Governorate status updated successfully.');
    }
}