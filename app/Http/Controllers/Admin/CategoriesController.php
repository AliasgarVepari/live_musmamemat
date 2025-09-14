<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Database\QueryException;

class CategoriesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::orderBy('name_en');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                  ->orWhere('name_ar', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $categories = $query->paginate(10)->withQueryString();

        return Inertia::render('admin/master-module/categories/index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/master-module/categories/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'icon_url' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive',
        ]);

        $slug = Str::slug($request->name_en);

        // Check for duplicate slug
        if (Category::where('slug', $slug)->exists()) {
            return back()->withErrors(['name_en' => 'A category with this name already exists.']);
        }

        try {
            Category::create([
                'name_en' => $request->name_en,
                'name_ar' => $request->name_ar,
                'slug' => $slug,
                'icon_url' => $request->icon_url,
                'status' => $request->status,
            ]);

            return redirect()->route('categories.index')
                ->with('success', 'Category created successfully.');
        } catch (QueryException $e) {
            if ($e->getCode() == 23505) { // Unique constraint violation
                return back()->withErrors(['name_en' => 'A category with this name already exists.']);
            }
            return back()->withErrors(['error' => 'An error occurred while creating the category.']);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return Inertia::render('admin/master-module/categories/show', [
            'category' => $category,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        return Inertia::render('admin/master-module/categories/edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'icon_url' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive',
        ]);

        $slug = Str::slug($request->name_en);

        // Check for duplicate slug (excluding current category)
        if (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
            return back()->withErrors(['name_en' => 'A category with this name already exists.']);
        }

        try {
            $category->update([
                'name_en' => $request->name_en,
                'name_ar' => $request->name_ar,
                'slug' => $slug,
                'icon_url' => $request->icon_url,
                'status' => $request->status,
            ]);

            return redirect()->route('categories.index')
                ->with('success', 'Category updated successfully.');
        } catch (QueryException $e) {
            if ($e->getCode() == 23505) { // Unique constraint violation
                return back()->withErrors(['name_en' => 'A category with this name already exists.']);
            }
            return back()->withErrors(['error' => 'An error occurred while updating the category.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Check if category is being used by ads
        if ($category->ads()->count() > 0) {
            return back()->withErrors(['category' => 'Cannot delete category that is being used by ads.']);
        }

        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    /**
     * Toggle the status of a category
     */
    public function toggle(Category $category)
    {
        $category->update([
            'status' => $category->status === 'active' ? 'inactive' : 'active'
        ]);

        return back()->with('success', 'Category status updated successfully.');
    }
}