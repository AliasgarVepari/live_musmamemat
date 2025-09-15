<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SocialLink;
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
        $query = SocialLink::orderBy('created_at', 'desc');

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
            'platform' => 'required|string|max:255',
            'url' => 'required|url|max:500',
        ]);

        SocialLink::create([
            'platform' => $request->platform,
            'url' => $request->url,
            'is_active' => true,
        ]);

        return redirect()->route('social-links.index')
            ->with('success', 'Social link created successfully.');
    }

    /**
     * Show the form for editing a social link
     */
    public function edit(SocialLink $socialLink): Response
    {

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
        ]);

        $socialLink->update([
            'platform' => $request->platform,
            'url' => $request->url,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('social-links.index')
            ->with('success', 'Social link updated successfully.');
    }

    /**
     * Remove the specified social link
     */
    public function destroy(SocialLink $socialLink)
    {
        $socialLink->delete();

        return redirect()->route('social-links.index')
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