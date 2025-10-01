<?php

use App\Http\Controllers\Api\User\AuthController;
use App\Http\Controllers\Api\User\BannersController;
use App\Http\Controllers\Api\User\CategoriesController;
use App\Http\Controllers\Api\User\ConditionsController;
use App\Http\Controllers\Api\User\GovernoratesController;
use App\Http\Controllers\Api\User\HomeApiController;
use App\Http\Controllers\Api\User\PriceTypesController;
use App\Http\Controllers\Api\User\ProductApiController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\User\SocialLinkingController;

/*
|--------------------------------------------------------------------------
| User API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for the user-facing website.
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

Route::prefix('user')->group(function () {
    // Authentication routes
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    
    // Social phone OTP flow (after Apple login)
    Route::post('/auth/phone/send-otp', [SocialLinkingController::class, 'sendPhoneOtp']);
    Route::post('/auth/phone/verify-otp', [SocialLinkingController::class, 'verifyPhoneOtp']);

    // Home page data
    Route::get('/home', [HomeApiController::class, 'index']);
    Route::get('/banners', [BannersController::class, 'index']);
    Route::get('/featured-ads', [HomeApiController::class, 'featuredAds']);
    Route::get('/social-links', [HomeApiController::class, 'socialLinks']);

    // Products
    Route::get('/products', [ProductApiController::class, 'index']);
    Route::get('/products/{id}', [ProductApiController::class, 'show']);
    Route::post('/products/{id}/contact', [ProductApiController::class, 'incrementContactCount']);

    // Filter options
    Route::get('/categories', [CategoriesController::class, 'index']);
    Route::get('/governorates', [GovernoratesController::class, 'index']);
    Route::get('/conditions', [ConditionsController::class, 'index']);
    Route::get('/price-types', [PriceTypesController::class, 'index']);

    // Selling wizard routes
    Route::post('/ads', [ProductApiController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/ads/{id}', [ProductApiController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/ads/{id}', [ProductApiController::class, 'destroy'])->middleware('auth:sanctum');
    Route::patch('/ads/{id}/current-step', [ProductApiController::class, 'updateCurrentStep'])->middleware('auth:sanctum');
    Route::get('/subscription-plans', [ProductApiController::class, 'subscriptionPlans']);
    Route::get('/subscription-plans/upgrade', [ProductApiController::class, 'getUpgradePlans'])->middleware(['web', 'api.auth']);
    Route::get('/subscription-plans/upgrade-eligibility', [ProductApiController::class, 'checkUpgradeEligibility'])->middleware('auth:sanctum');
    Route::get('/subscription-plans/upgrade-options', [ProductApiController::class, 'upgradeSubscriptionPlans'])->middleware('auth:sanctum');
    Route::get('/subscription-plans/upgrade-options-for-profile', [ProductApiController::class, 'upgradeSubscriptionPlansForProfile'])->middleware('auth:sanctum');
    Route::get('/subscription', [ProductApiController::class, 'getUserSubscription'])->middleware('auth:sanctum');
    Route::post('/ads/{id}/subscription', [ProductApiController::class, 'assignSubscription'])->middleware('auth:sanctum');
    Route::post('/subscription/upgrade', [ProductApiController::class, 'upgradeSubscription'])->middleware('auth:sanctum');
    Route::post('/subscription/upgrade-from-profile', [ProductApiController::class, 'upgradeSubscriptionFromProfile'])->middleware('auth:sanctum');

    // Favorites routes
    Route::post('/products/{id}/favorite', [ProductApiController::class, 'addToFavorites'])->middleware('auth:sanctum');
    Route::delete('/products/{id}/favorite', [ProductApiController::class, 'removeFromFavorites'])->middleware('auth:sanctum');
    Route::get('/products/{id}/favorite', [ProductApiController::class, 'checkFavorite'])->middleware('auth:sanctum');
    Route::get('/favorites', [ProductApiController::class, 'getFavorites'])->middleware('auth:sanctum');
});
