<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannersController extends Controller
{
    /**
     * Get active banners for a specific position
     */
    public function index(Request $request)
    {
        $position = $request->get('position'); // 'top' or 'bottom'

        $query = Banner::where('status', 'active');

        if ($position) {
            $query->where('position', $position);
        }

        $banners = $query->orderBy('created_at', 'desc')->get([
            'id', 'image_url_en', 'image_url_ar', 'position', 'status', 'created_at',
        ]);

        return response()->json([
            'banners' => $banners,
        ]);
    }
}
