<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\PriceType;
use Illuminate\Http\Request;

class PriceTypesController extends Controller
{
    public function index(Request $request)
    {
        $priceTypes = PriceType::where('is_active', true)
            ->orderBy('name_en')
            ->get();

        return response()->json([
            'priceTypes' => $priceTypes,
        ]);
    }
}
