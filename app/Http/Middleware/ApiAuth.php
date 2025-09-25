<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ApiAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Start session if not already started
        if (!$request->hasSession()) {
            $request->setLaravelSession(app('session.store'));
        }
        
        // Try web guard first (session-based), then sanctum (token-based)
        $webUser = Auth::guard('web')->user();
        $sanctumUser = Auth::guard('sanctum')->user();
        
        $user = $webUser ?? $sanctumUser;
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        // Check if user is suspended or deleted
        if ($user->status === 'suspended') {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been suspended. ' . ($user->suspension_reason ? 'Reason: ' . $user->suspension_reason : '') . ' To reactivate your account, please contact live-musamemat@support.com'
            ], 403);
        }

        if ($user->status === 'deleted') {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deleted. ' . ($user->deletion_reason ? 'Reason: ' . $user->deletion_reason : '') . ' To reactivate your account, please contact live-musamemat@support.com'
            ], 403);
        }

        // Set the authenticated user for the request
        Auth::setUser($user);

        return $next($request);
    }
}