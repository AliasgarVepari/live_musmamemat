<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SocialLink;
use App\Models\AdminUser;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialLinksController extends Controller
{
    /**
     * Display a listing of social links
     */
    public function index(Request $request): Response
    {
        $query = SocialLink::with('linkable')
            ->orderBy('created_at', 'desc');

        // Filter by platform if provided
        if ($request->has('platform') && $request->platform) {
            $query->where('platform', $request->platform);
        }

        // Filter by status if provided
        if ($request->has('status') && $request->status !== '') {
            $query->where('is_active', $request->status === 'active');
        }

        $socialLinks = $query->paginate(20);

        return Inertia::render('admin/master-module/social-links/index', [
            'socialLinks' => $socialLinks,
            'filters' => [
                'platform' => $request->platform,
                'status' => $request->status,
            ],
            'platforms' => SocialLink::distinct()->pluck('platform')->sort()->values(),
        ]);
    }

    /**
     * Show the form for creating a new social link
     */
    public function create(): Response
    {
        return Inertia::render('admin/master-module/social-links/create', [
            'linkableTypes' => [
                ['value' => 'admin', 'label' => 'Admin User'],
                ['value' => 'user', 'label' => 'Regular User'],
            ],
            'platforms' => [
                'facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'tiktok', 'snapchat', 'whatsapp', 'telegram'
            ],
        ]);
    }

    /**
     * Store a newly created social link
     */
    public function store(Request $request)
    {
        $request->validate([
            'linkable_type' => 'required|in:admin,user',
            'linkable_id' => 'required|integer',
            'platform' => 'required|string|max:255',
            'url' => 'required|url|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Verify the linkable entity exists
        $linkableClass = $request->linkable_type === 'admin' ? AdminUser::class : User::class;
        $linkable = $linkableClass::find($request->linkable_id);
        
        if (!$linkable) {
            return back()->withErrors(['linkable_id' => 'The selected user does not exist.']);
        }

        SocialLink::create([
            'linkable_type' => $linkableClass,
            'linkable_id' => $request->linkable_id,
            'platform' => $request->platform,
            'url' => $request->url,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return redirect()->route('admin.social-links.index')
            ->with('success', 'Social link created successfully.');
    }

    /**
     * Show the form for editing a social link
     */
    public function edit(SocialLink $socialLink): Response
    {
        $socialLink->load('linkable');

        return Inertia::render('admin/master-module/social-links/edit', [
            'socialLink' => $socialLink,
            'platforms' => [
                'facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'tiktok', 'snapchat', 'whatsapp', 'telegram'
            ],
        ]);
    }

    /**
     * Update the specified social link
     */
    public function update(Request $request, SocialLink $socialLink)
    {
        $request->validate([
            'platform' => 'required|string|max:255',
            'url' => 'required|url|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $socialLink->update([
            'platform' => $request->platform,
            'url' => $request->url,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return redirect()->route('admin.social-links.index')
            ->with('success', 'Social link updated successfully.');
    }

    /**
     * Remove the specified social link
     */
    public function destroy(SocialLink $socialLink)
    {
        $socialLink->delete();

        return redirect()->route('admin.social-links.index')
            ->with('success', 'Social link deleted successfully.');
    }

    /**
     * Toggle the active status of a social link
     */
    public function toggle(SocialLink $socialLink)
    {
        $socialLink->update(['is_active' => !$socialLink->is_active]);

        return back()->with('success', 'Social link status updated successfully.');
    }
}