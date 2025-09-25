<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\FuzzySearch;

class CategoriesController extends Controller
{
    use FuzzySearch;
    protected $imageUploadService;

    public function __construct(ImageUploadService $imageUploadService)
    {
        $this->imageUploadService = $imageUploadService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::orderBy('sort_order')->orderBy('name_en');

        // Apply filters with fuzzy search
        if ($request->filled('search')) {
            $searchFields = ['name_en', 'name_ar', 'slug'];
            $relationFields = [];
            
            $this->applyFuzzySearch($query, $request->search, $searchFields, $relationFields);
        }

        if ($request->filled('status') && in_array($request->status, ['active', 'inactive'])) {
            $query->where('status', $request->status);
        }

        $categories = $query->paginate(10)->withQueryString();

        // Attach temporary URL for icons (works even when objects are private)
        $bucket = config('filesystems.disks.s3.bucket');
        $categories->getCollection()->transform(function (Category $category) use ($bucket) {
            if ($category->icon_url) {
                $path = parse_url($category->icon_url, PHP_URL_PATH) ?: '';
                $path = ltrim($path, '/');
                if (str_starts_with($path, $bucket . '/')) {
                    $path = substr($path, strlen($bucket) + 1);
                }
                try {
                    $category->icon_temp_url = Storage::disk('s3')->temporaryUrl($path, now()->addMinutes(60));
                } catch (\Throwable $e) {
                    $category->icon_temp_url = $category->icon_url; // fallback
                }
            }
            return $category;
        });
        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'filters'    => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/categories/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_en'    => 'required|string|max:255',
            'name_ar'    => 'required|string|max:255',
            'icon'       => 'required|mimes:svg,svgz|max:10240',
            'status'     => 'required|in:active,inactive',
            'sort_order' => 'nullable|integer|min:1',
        ]);

        $slug = Str::slug($request->name_en);

        // Check for duplicate slug
        if (Category::where('slug', $slug)->exists()) {
            return back()->withErrors(['name_en' => 'A category with this name already exists.']);
        }

        // Check for duplicate sort_order if provided
        if ($request->filled('sort_order')) {
            if (Category::where('sort_order', $request->sort_order)->exists()) {
                return back()->withErrors(['sort_order' => 'A category with this sort order already exists.']);
            }
        }

        try {
            // Handle icon upload if provided
            if ($request->hasFile('icon')) {
                $iconUrl               = $this->imageUploadService->uploadImage($request->file('icon'), 'category');
                $validated['icon_url'] = $iconUrl;
            }

            Category::create([
                'name_en'    => $validated['name_en'],
                'name_ar'    => $validated['name_ar'],
                'slug'       => $slug,
                'icon_url'   => $validated['icon_url'] ?? null,
                'status'     => $validated['status'],
                'sort_order' => $validated['sort_order'] ?? null,
            ]);

            return redirect()->route('categories.index')
                ->with('success', 'Category created successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create category: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        return Inertia::render('admin/categories/edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name_en'     => 'required|string|max:255',
            'name_ar'     => 'required|string|max:255',
            'icon'        => 'nullable|mimes:svg,svgz|max:10240',
            'status'      => 'required|in:active,inactive',
            'sort_order'  => 'nullable|integer|min:1',
            'remove_icon' => 'nullable|boolean',
        ]);

        $slug = Str::slug($request->name_en);

        // Check for duplicate slug (excluding current category)
        if (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
            return back()->withErrors(['name_en' => 'A category with this name already exists.']);
        }

        // Check for duplicate sort_order if provided (excluding current category)
        if ($request->filled('sort_order')) {
            if (Category::where('sort_order', $request->sort_order)->where('id', '!=', $category->id)->exists()) {
                return back()->withErrors(['sort_order' => 'A category with this sort order already exists.']);
            }
        }

        try {
            // Handle icon upload/removal
            if ($request->hasFile('icon')) {
                // Delete old icon if exists
                if ($category->icon_url) {
                    $this->imageUploadService->deleteImage($category->icon_url);
                }

                $iconUrl               = $this->imageUploadService->uploadImage($request->file('icon'), 'category');
                $validated['icon_url'] = $iconUrl;
            } elseif ($request->boolean('remove_icon')) {
                // Remove existing icon if requested
                if ($category->icon_url) {
                    $this->imageUploadService->deleteImage($category->icon_url);
                }
                $validated['icon_url'] = null;
            } else {
                // Keep existing icon_url if no changes
                $validated['icon_url'] = $category->icon_url;
            }

            $category->update([
                'name_en'    => $validated['name_en'],
                'name_ar'    => $validated['name_ar'],
                'slug'       => $slug,
                'icon_url'   => $validated['icon_url'],
                'status'     => $validated['status'],
                'sort_order' => $validated['sort_order'] ?? null,
            ]);

            return redirect()->route('categories.index')
                ->with('success', 'Category updated successfully.');
        } catch (\Exception $e) {
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

        // Delete icon from S3 if exists
        if ($category->icon_url) {
            $this->imageUploadService->deleteImage($category->icon_url);
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
            'status' => $category->status === 'active' ? 'inactive' : 'active',
        ]);

        return back()->with('success', 'Category status updated successfully.');
    }
}
