<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|min:8|max:8',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find user by phone
        $user = User::where('phone', $request->phone)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Check if user is suspended
        if ($user->status === 'suspended') {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been suspended. ' . ($user->suspension_reason ? 'Reason: ' . $user->suspension_reason : '') . ' To reactivate your account, please contact live-musamemat@support.com'
            ], 403);
        }

        // Check if user is deleted
        if ($user->status === 'deleted') {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deleted. ' . ($user->deletion_reason ? 'Reason: ' . $user->deletion_reason : '') . ' To reactivate your account, please contact live-musamemat@support.com'
            ], 403);
        }

        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name_en' => $user->name_en,
                    'name_ar' => $user->name_ar,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'phone_whatsapp' => $user->phone_whatsapp,
                    'bio_en' => $user->bio_en,
                    'bio_ar' => $user->bio_ar,
                    'profile_picture_url' => $user->profile_picture_url,
                    'governorate' => $user->governorate,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }

    /**
     * Register user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fullName' => 'required|string|max:255',
            'phone' => 'required|string|min:8|max:8|unique:users,phone',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate OTP
        $otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store OTP in session for verification
        session(['otp_' . $request->phone => $otp]);
        session(['otp_expires_' . $request->phone => now()->addMinutes(10)]);

        // Create user (but don't activate yet)
        $user = User::create([
            'name_en' => $request->fullName,
            'name_ar' => $request->fullName, // For now, use same name for both
            'phone' => $request->phone,
            'email' => null, // Email is now nullable
            'password' => Hash::make($request->password),
            'status' => 'inactive', // Will be activated after OTP verification
            'governorate_id' => 1, // Default governorate (assuming ID 1 exists)
            'email_verified_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Please verify your phone number.',
            'data' => [
                'otp' => $otp, // In production, this should be sent via SMS
                'phone' => $request->phone,
                'expires_in' => 600 // 10 minutes in seconds
            ]
        ]);
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|min:8|max:8',
            'otp' => 'required|string|min:6|max:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // For demo purposes, accept any 6-digit OTP
        if (strlen($request->otp) !== 6 || !ctype_digit($request->otp)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP format'
            ], 400);
        }

        // Find and activate user
        $user = User::where('phone', $request->phone)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Activate user
        $user->update([
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Clear OTP from session
        session()->forget(['otp_' . $request->phone, 'otp_expires_' . $request->phone]);

        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Phone number verified successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name_en' => $user->name_en,
                    'name_ar' => $user->name_ar,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'phone_whatsapp' => $user->phone_whatsapp,
                    'bio_en' => $user->bio_en,
                    'bio_ar' => $user->bio_ar,
                    'profile_picture_url' => $user->profile_picture_url,
                    'governorate' => $user->governorate,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $user = $request->user('sanctum');
        
        // Revoke all tokens for the user (more secure)
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user('sanctum');
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name_en' => $user->name_en,
                    'name_ar' => $user->name_ar,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'phone_whatsapp' => $user->phone_whatsapp,
                    'bio_en' => $user->bio_en,
                    'bio_ar' => $user->bio_ar,
                    'profile_picture_url' => $user->profile_picture_url,
                    'governorate' => $user->governorate,
                ]
            ]
        ]);
    }
}
