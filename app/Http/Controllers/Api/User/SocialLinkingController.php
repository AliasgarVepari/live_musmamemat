<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class SocialLinkingController extends Controller
{
    public function sendPhoneOtp(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'phone' => 'required|string|min:8|max:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $phone = $request->phone;
        $otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        session(['social_phone_otp_' . $phone => $otp]);
        session(['social_phone_otp_expires_' . $phone => now()->addMinutes(10)]);

        // In production send via SMS provider
        return response()->json(['success' => true, 'message' => 'OTP sent', 'data' => ['otp' => $otp]]);
    }

    public function verifyPhoneOtp(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'phone' => 'required|string|min:8|max:8',
            'otp' => 'required|string|min:6|max:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $phone = $request->phone;
        $otp = $request->otp;
        $expected = session('social_phone_otp_' . $phone);
        $expiresAt = session('social_phone_otp_expires_' . $phone);

        if (!$expected || !$expiresAt || now()->greaterThan($expiresAt) || $expected !== $otp) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired OTP'], 422);
        }

        // Resolve pending social account
        $pendingId = session('pending_social_account_id');
        if (!$pendingId) {
            return response()->json(['success' => false, 'message' => 'No pending social account'], 400);
        }

        $account = SocialAccount::find($pendingId);
        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Pending social account not found'], 404);
        }

        // Find or create user by phone
        $user = User::where('phone', $phone)->first();
        if (!$user) {
            $user = User::create([
                'phone' => $phone,
                'password' => Hash::make(str()->random(32)),
                'status' => 'active',
                'governorate_id' => 1,
            ]);
        }

        // Link and login
        $account->user()->associate($user);
        $account->save();

        // Clear session state
        session()->forget('social_phone_otp_' . $phone);
        session()->forget('social_phone_otp_expires_' . $phone);
        session()->forget('pending_social_account_id');

        // Issue Sanctum token for API consumers
        $token = $user->createToken('auth_token')->plainTextToken;

        // Also log in to web guard for Inertia
        Auth::guard('web')->login($user);

        return response()->json([
            'success' => true,
            'message' => 'Phone verified and account linked',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name_en' => $user->name_en,
                    'name_ar' => $user->name_ar,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'profile_picture_url' => $user->profile_picture_url,
                    'governorate' => $user->governorate,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }
}


