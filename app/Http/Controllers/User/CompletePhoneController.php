<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompletePhoneController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('user/CompletePhone', [
            'provider_user_id' => $request->get('provider_user_id')
        ]);
    }
}
