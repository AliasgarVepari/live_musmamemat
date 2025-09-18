<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BannerController extends Controller
{
    public function index(Request $request)
    {
        $query = Banner::query();

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('image_url', 'like', "%{$search}%")
                  ->orWhere('link_url', 'like', "%{$search}%");
            });
        }

        if ($request->filled('position')) {
            $query->where('position', $request->position);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('is_approved')) {
            $query->where('is_approved', $request->is_approved === 'true');
        }

        // Get banners with pagination
        $banners = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('admin/banners/index', [
            'banners' => $banners,
            'filters' => $request->only(['search', 'position', 'status', 'is_approved']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/banners/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'image_en' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'image_ar' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'position' => 'required|in:top,bottom',
            'status' => 'required|in:active,inactive',
        ]);

        $imageUrlEn = null;
        $imageUrlAr = null;

        // Handle English image upload
        if ($request->hasFile('image_en')) {
            $image = $request->file('image_en');
            $imageName = time() . '_en_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('banners', $imageName, 's3');
            $imageUrlEn = Storage::disk('s3')->url($imagePath);
        }

        // Handle Arabic image upload
        if ($request->hasFile('image_ar')) {
            $image = $request->file('image_ar');
            $imageName = time() . '_ar_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('banners', $imageName, 's3');
            $imageUrlAr = Storage::disk('s3')->url($imagePath);
        }

        Banner::create([
            'image_url_en' => $imageUrlEn,
            'image_url_ar' => $imageUrlAr,
            'position' => $request->position,
            'status' => $request->status,
            'created_by' => 'admin',
            'created_by_id' => auth()->id(),
            'is_approved' => true, // Admin created banners are auto-approved
        ]);

        return redirect()->route('admin.banners.index')
            ->with('success', 'Banner created successfully.');
    }

    public function show(Banner $banner)
    {
        return Inertia::render('admin/banners/show', [
            'banner' => $banner,
        ]);
    }

    public function edit(Banner $banner)
    {
        return Inertia::render('admin/banners/edit', [
            'banner' => $banner,
        ]);
    }

    public function update(Request $request, Banner $banner)
    {
        $request->validate([
            'image_en' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'image_ar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'position' => 'required|in:top,bottom',
            'status' => 'required|in:active,inactive',
        ]);

        $data = [
            'position' => $request->position,
            'status' => $request->status,
        ];

        // Handle English image upload if new image is provided
        if ($request->hasFile('image_en')) {
            // Delete old English image
            if ($banner->image_url_en) {
                $oldImagePath = str_replace(Storage::disk('s3')->url(''), '', $banner->image_url_en);
                Storage::disk('s3')->delete($oldImagePath);
            }

            $image = $request->file('image_en');
            $imageName = time() . '_en_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('banners', $imageName, 's3');
            $data['image_url_en'] = Storage::disk('s3')->url($imagePath);
        }

        // Handle Arabic image upload if new image is provided
        if ($request->hasFile('image_ar')) {
            // Delete old Arabic image
            if ($banner->image_url_ar) {
                $oldImagePath = str_replace(Storage::disk('s3')->url(''), '', $banner->image_url_ar);
                Storage::disk('s3')->delete($oldImagePath);
            }

            $image = $request->file('image_ar');
            $imageName = time() . '_ar_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('banners', $imageName, 's3');
            $data['image_url_ar'] = Storage::disk('s3')->url($imagePath);
        }

        $banner->update($data);

        return redirect()->route('admin.banners.index')
            ->with('success', 'Banner updated successfully.');
    }

    public function destroy(Banner $banner)
    {
        // Delete images from storage
        if ($banner->image_url_en) {
            $imagePath = str_replace(Storage::disk('s3')->url(''), '', $banner->image_url_en);
            Storage::disk('s3')->delete($imagePath);
        }
        
        if ($banner->image_url_ar) {
            $imagePath = str_replace(Storage::disk('s3')->url(''), '', $banner->image_url_ar);
            Storage::disk('s3')->delete($imagePath);
        }

        $banner->delete();

        return redirect()->route('admin.banners.index')
            ->with('success', 'Banner deleted successfully.');
    }

    public function toggleStatus(Banner $banner)
    {
        $banner->update([
            'status' => $banner->status === 'active' ? 'inactive' : 'active'
        ]);

        return back()->with('success', 'Banner status updated successfully.');
    }
}
