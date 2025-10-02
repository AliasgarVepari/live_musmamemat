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
        $otp = '123456'; // Static OTP for development
        
        // Store OTP in session with proper keys
        Session::put('social_phone_otp_' . $phone, $otp);
        Session::put('social_phone_otp_expires_' . $phone, now()->addMinutes(10));

        // For development: log the OTP to console/logs
        \Log::info('Social Login OTP for phone ' . $phone . ': ' . $otp);
        
        // In production, send via SMS provider here
        // For now, return success without exposing OTP
        return response()->json([
            'success' => true, 
            'message' => 'OTP sent to your phone number',
            'data' => [
                'phone' => $phone,
                'expires_in' => 600 // 10 minutes in seconds
            ]
        ]);
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
        $expected = Session::get('social_phone_otp_' . $phone);
        $expiresAt = Session::get('social_phone_otp_expires_' . $phone);

        if (!$expected || !$expiresAt || now()->greaterThan($expiresAt) || $expected !== $otp) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired OTP'], 422);
        }

        // Clear OTP from session after successful verification
        Session::forget('social_phone_otp_' . $phone);
        Session::forget('social_phone_otp_expires_' . $phone);

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


