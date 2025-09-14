<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Condition;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConditionsController extends Controller
{
    /**
     * Display a listing of conditions
     */
    public function index(Request $request): Response
    {
        $query = Condition::orderBy('sort_order')->orderBy('name_en');

        // Filter by status if provided
        if ($request->has('status') && $request->status !== '') {
            $query->where('is_active', $request->status === 'active');
        }

        $conditions = $query->paginate(20);

        return Inertia::render('admin/master-module/conditions/index', [
            'conditions' => $conditions,
            'filters' => [
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new condition
     */
    public function create(): Response
    {
        return Inertia::render('admin/master-module/conditions/create');
    }

    /**
     * Store a newly created condition
     */
    public function store(Request $request)
    {
        $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Generate slug from English name
        $slug = \Str::slug($request->name_en);

        // Check if slug already exists
        if (Condition::where('slug', $slug)->exists()) {
            return back()->withErrors(['name_en' => 'A condition with this name already exists.']);
        }

        try {
            Condition::create([
                'name_en' => $request->name_en,
                'name_ar' => $request->name_ar,
                'slug' => $slug,
                'is_active' => $request->boolean('is_active', true),
                'sort_order' => $request->sort_order ?? 0,
            ]);

            return redirect()->route('conditions.index')
                ->with('success', 'Condition created successfully.');
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23505) { // Unique constraint violation
                return back()->withErrors(['name_en' => 'A condition with this name already exists.']);
            }
            throw $e;
        }
    }

    /**
     * Show the form for editing a condition
     */
    public function edit(Condition $condition): Response
    {
        return Inertia::render('admin/master-module/conditions/edit', [
            'condition' => $condition,
        ]);
    }

    /**
     * Update the specified condition
     */
    public function update(Request $request, Condition $condition)
    {
        $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Generate slug from English name
        $slug = \Str::slug($request->name_en);

        $condition->update([
            'name_en' => $request->name_en,
            'name_ar' => $request->name_ar,
            'slug' => $slug,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return redirect()->route('conditions.index')
            ->with('success', 'Condition updated successfully.');
    }

    /**
     * Remove the specified condition
     */
    public function destroy(Condition $condition)
    {
        // Check if condition is being used by ads
        if ($condition->ads()->count() > 0) {
            return back()->withErrors(['condition' => 'Cannot delete condition that is being used by ads.']);
        }

        $condition->delete();

        return redirect()->route('conditions.index')
            ->with('success', 'Condition deleted successfully.');
    }

    /**
     * Toggle the active status of a condition
     */
    public function toggle(Condition $condition)
    {
        $condition->update(['is_active' => !$condition->is_active]);

        return back()->with('success', 'Condition status updated successfully.');
    }

    /**
     * Update the sort order of conditions
     */
    public function updateOrder(Request $request)
    {
        $request->validate([
            'conditions' => 'required|array',
            'conditions.*.id' => 'required|integer|exists:conditions,id',
            'conditions.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($request->conditions as $conditionData) {
            Condition::where('id', $conditionData['id'])
                ->update(['sort_order' => $conditionData['sort_order']]);
        }

        return back()->with('success', 'Sort order updated successfully.');
    }
}