<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirect(string $provider)
    {
        // Support both Apple and Google
        abort_unless(in_array($provider, ['apple', 'google']), 404);
        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider)
    {
        abort_unless(in_array($provider, ['apple', 'google']), 404);

        try {
            $providerUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Throwable $e) {
            Log::warning('Social callback error', ['provider' => $provider, 'error' => $e->getMessage()]);
            return redirect('/')->with('error', 'Unable to authenticate with ' . ucfirst($provider));
        }

        $providerId = $providerUser->getId();

        // 1) If already linked, login
        $account = SocialAccount::where('provider', $provider)
            ->where('provider_user_id', $providerId)
            ->first();

        if ($account && $account->user) {
            Auth::guard('web')->login($account->user);
            return redirect()->route('user.profile');
        }

        // 2) Not linked yet: create or update a pending social account
        $pending = SocialAccount::updateOrCreate(
            ['provider' => $provider, 'provider_user_id' => $providerId],
            [
                'name' => $providerUser->getName(),
                'email' => $providerUser->getEmail(), // Store email from social provider
                'avatar' => $providerUser->getAvatar(),
                'raw' => $providerUser->user ?? null,
            ]
        );

        // Redirect to phone completion page with provider_user_id as parameter
        return redirect()->route('user.complete-phone', ['provider_user_id' => $pending->provider_user_id]);
    }

    /**
     * Test method for localhost - simulates Apple callback
     */
    public function testCallback()
    {
        // Simulate Apple user data
        $mockProviderUser = (object) [
            'id' => 'test_apple_user_' . time(),
            'name' => 'Test Apple User',
            'email' => 'test@example.com',
            'avatar' => 'https://via.placeholder.com/150',
            'user' => ['sub' => 'test_apple_user_' . time()]
        ];

        $providerId = $mockProviderUser->id;

        // 1) If already linked, login
        $account = SocialAccount::where('provider', 'apple')
            ->where('provider_user_id', $providerId)
            ->first();

        if ($account && $account->user) {
            Auth::guard('web')->login($account->user);
            return redirect()->route('user.profile');
        }

        // 2) Not linked yet: create or update a pending social account
        $pending = SocialAccount::updateOrCreate(
            ['provider' => 'apple', 'provider_user_id' => $providerId],
            [
                'name' => $mockProviderUser->name,
                'email' => $mockProviderUser->email, // Store email from mock data
                'avatar' => $mockProviderUser->avatar,
                'raw' => $mockProviderUser->user,
            ]
        );

        // Redirect to phone completion page with provider_user_id as parameter
        return redirect()->route('user.complete-phone', ['provider_user_id' => $pending->provider_user_id]);
    }

    /**
     * Test method for localhost - simulates Google callback
     */
    public function testGoogleCallback()
    {
        // Simulate Google user data
        $mockProviderUser = (object) [
            'id' => 'test_google_user_' . time(),
            'name' => 'Test Google User',
            'email' => 'test.google@example.com',
            'avatar' => 'https://via.placeholder.com/150',
            'user' => ['sub' => 'test_google_user_' . time()]
        ];

        $providerId = $mockProviderUser->id;

        // 1) If already linked, login
        $account = SocialAccount::where('provider', 'google')
            ->where('provider_user_id', $providerId)
            ->first();

        if ($account && $account->user) {
            Auth::guard('web')->login($account->user);
            return redirect()->route('user.profile');
        }

        // 2) Not linked yet: create or update a pending social account
        $pending = SocialAccount::updateOrCreate(
            ['provider' => 'google', 'provider_user_id' => $providerId],
            [
                'name' => $mockProviderUser->name,
                'email' => $mockProviderUser->email, // Store email from mock data
                'avatar' => $mockProviderUser->avatar,
                'raw' => $mockProviderUser->user,
            ]
        );

        // Redirect to phone completion page with provider_user_id as parameter
        return redirect()->route('user.complete-phone', ['provider_user_id' => $pending->provider_user_id]);
    }
}


