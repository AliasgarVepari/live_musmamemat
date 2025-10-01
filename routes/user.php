<?php

use App\Http\Controllers\User\HomeController;
use App\Http\Controllers\User\ProductController;
use App\Http\Controllers\User\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\SocialAuthController;

Route::prefix('/')->group(function () {
    // Home page
    Route::get('/', [HomeController::class, 'index'])->name('user.home');

    // Search functionality
    Route::get('/search', [HomeController::class, 'search'])->name('user.search');
    Route::post('/search', [HomeController::class, 'search'])->name('user.search.post');

    // Product listing and details
    Route::get('/products', [ProductController::class, 'index'])->name('user.products.index');
    Route::get('/product/{id}', [ProductController::class, 'show'])->whereNumber('id')->name('user.product.show');
    Route::get('/product/search', [ProductController::class, 'search'])->name('user.product.search');

    // Category listing (redirect to products with category filter)
    Route::get('/category/{slug}', function (string $slug) {
        return redirect()->route('user.products.index', ['category' => $slug]);
    })->name('user.category.show');


    // Catch-all under /sell (e.g., /sell, /sell/step-1, /sell/anything/here)
    Route::get('/sell/{any?}', function ($any = 'category') {
        return Inertia::render('user/SellWizard', [
            'step' => $any
        ]);
    })->where('any', '.*')->name('user.sell');

    Route::get('/wishlist', fn() => Inertia::render('user/Wishlist'))
        ->name('user.wishlist');

    // Auth token login route
    Route::get('/auth/login/{token}', function (string $token) {
        // Find user by token
        $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
        
        if (!$personalAccessToken) {
            return redirect()->route('user.home')->with('error', 'Invalid authentication token');
        }
        
        // Get the user
        $user = $personalAccessToken->tokenable;
        
        if (!$user) {
            return redirect()->route('user.home')->with('error', 'User not found');
        }
        
        // Check if user is suspended
        if ($user->status === 'suspended') {
            $message = 'Your account has been suspended. ' . ($user->suspension_reason ? 'Reason: ' . $user->suspension_reason : '') . ' To reactivate your account, please contact live-musamemat@support.com';
            return redirect()->route('user.home')->with('error', $message);
        }
        
        // Check if user is deleted
        if ($user->status === 'deleted') {
            $message = 'Your account has been deleted. ' . ($user->deletion_reason ? 'Reason: ' . $user->deletion_reason : '') . ' To reactivate your account, please contact live-musamemat@support.com';
            return redirect()->route('user.home')->with('error', $message);
        }
        
        // Log the user in using the 'web' guard specifically for website users
        \Illuminate\Support\Facades\Auth::guard('web')->login($user);
        
        // Redirect to profile
        return redirect()->route('user.profile');
    })->name('user.auth.login');
    
    Route::get('/profile', [ProfileController::class, 'index'])->name('user.profile');
    Route::post('/profile', [ProfileController::class, 'update'])->name('user.profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('user.profile.avatar');
    Route::get('/profile/ads', [ProfileController::class, 'getAds'])->name('user.profile.ads');
    Route::get('/profile/listings', [ProfileController::class, 'getListings'])->name('user.profile.listings');
    Route::get('/profile/wishlist', [ProfileController::class, 'getWishlist'])->name('user.profile.wishlist');
    Route::post('/profile/upgrade', [ProfileController::class, 'upgradeSubscription'])->name('user.profile.upgrade');
    Route::delete('/profile/ads/{id}', [ProfileController::class, 'deleteAd'])->name('user.profile.ads.delete');
    Route::put('/profile/ads/{id}', [ProfileController::class, 'updateAd'])->name('user.profile.ads.update');
    Route::post('/profile/ads/{id}/feature', [ProfileController::class, 'toggleFeatured'])->name('user.profile.ads.feature');
    
    // Social auth (Apple) - web redirect & callback (Apple may POST the callback)
    Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])
        ->whereIn('provider', ['apple'])
        ->name('user.social.redirect');
    Route::match(['GET','POST'], '/auth/{provider}/callback', [SocialAuthController::class, 'callback'])
        ->whereIn('provider', ['apple'])
        ->name('user.social.callback');

    // Test route for localhost - simulates Apple callback
    Route::get('/test-apple-callback', [SocialAuthController::class, 'testCallback'])->name('test.apple.callback');

    // Complete phone page
    Route::get('/complete-phone', function () {
        return Inertia::render('user/CompletePhone');
    })->name('user.complete-phone');
    
    // Logout route
    Route::post('/logout', function () {
        \Illuminate\Support\Facades\Auth::guard('web')->logout();
        return redirect()->route('user.home');
    })->name('user.logout');
});
