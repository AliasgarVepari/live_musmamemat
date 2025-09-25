<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('web')->user();
        
        if ($user) {
            // Check if user is suspended
            if ($user->status === 'suspended') {
                Auth::guard('web')->logout();
                $message = 'Your account has been suspended. ' . ($user->suspension_reason ? 'Reason: ' . $user->suspension_reason : '') . ' To reactivate your account, please contact live-musamemat@support.com';
                return redirect()->route('user.home')->with('error', $message);
            }
            
            // Check if user is deleted
            if ($user->status === 'deleted') {
                Auth::guard('web')->logout();
                $message = 'Your account has been deleted. ' . ($user->deletion_reason ? 'Reason: ' . $user->deletion_reason : '') . ' To reactivate your account, please contact live-musamemat@support.com';
                return redirect()->route('user.home')->with('error', $message);
            }
        }

        return $next($request);
    }
}