<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Governorate;
use Illuminate\Http\Request;

class GovernoratesController extends Controller
{
    public function index(Request $request)
    {
        $governorates = Governorate::where('is_active', true)
            ->orderBy('name_en')
            ->get();

        return response()->json([
            'governorates' => $governorates,
        ]);
    }
}
