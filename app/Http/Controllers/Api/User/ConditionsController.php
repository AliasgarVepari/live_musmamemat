<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Condition;
use Illuminate\Http\Request;

class ConditionsController extends Controller
{
    public function index(Request $request)
    {
        $conditions = Condition::where('is_active', true)
            ->orderBy('name_en')
            ->get();

        return response()->json([
            'conditions' => $conditions,
        ]);
    }
}
