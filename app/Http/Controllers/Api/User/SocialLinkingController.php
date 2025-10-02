<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\PhoneOtp;
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
            'provider_user_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $phone = $request->phone;
        $otp = '123456'; // Static OTP for development
        
        // Get provider_user_id from request or find the most recent pending social account
        $providerUserId = $request->provider_user_id ?? 
            SocialAccount::whereNull('user_id')->latest()->first()?->provider_user_id;
        
        // Clean up any existing OTPs for this phone
        PhoneOtp::where('phone', $phone)->delete();
        
        // Store OTP in database
        PhoneOtp::create([
            'phone' => $phone,
            'otp' => $otp,
            'provider_user_id' => $providerUserId,
            'expires_at' => now()->addMinutes(10),
        ]);

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
        
        // Find valid OTP in database
        $phoneOtp = PhoneOtp::findValid($phone, $otp);

        if (!$phoneOtp) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired OTP'], 422);
        }

        // Mark OTP as used
        $phoneOtp->markAsUsed();

        // Find the pending social account using provider_user_id from OTP
        $account = SocialAccount::where('provider_user_id', $phoneOtp->provider_user_id)
            ->whereNull('user_id')
            ->first();

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'No pending social account found for this OTP'], 400);
        }

        // Find or create user by phone
        $user = User::where('phone', $phone)->first();
        if (!$user) {
            // Get name and email from social account
            $socialName = $account->name ?? 'Social User';
            $socialEmail = $account->email; // Store email from social provider
            
            $user = User::create([
                'name_en' => $socialName,
                'name_ar' => $socialName, // Same name for both languages initially
                'phone' => $phone,
                'email' => $socialEmail, // Store email from social provider
                'password' => Hash::make(str()->random(32)),
                'status' => 'active',
                'governorate_id' => 1,
                'email_verified_at' => $socialEmail ? now() : null, // Verify if email exists
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


