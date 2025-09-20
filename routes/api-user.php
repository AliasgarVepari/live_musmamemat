<?php

use App\Http\Controllers\Api\User\BannersController;
use App\Http\Controllers\Api\User\CategoriesController;
use App\Http\Controllers\Api\User\HomeApiController;
use App\Http\Controllers\Api\User\ProductApiController;
use Illuminate\Support\Facades\Route;

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

Route::prefix('user')->group(function () {
    // Home page data
    Route::get('/home', [HomeApiController::class, 'index']);
    Route::get('/banners', [BannersController::class, 'index']);
    Route::get('/featured-ads', [HomeApiController::class, 'featuredAds']);
    Route::get('/social-links', [HomeApiController::class, 'socialLinks']);

    // Products
    Route::get('/products', [ProductApiController::class, 'index']);
    Route::get('/products/{id}', [ProductApiController::class, 'show']);

    // Filter options
    Route::get('/categories', [CategoriesController::class, 'index']);
    Route::get('/governorates', [ProductApiController::class, 'governorates']);
    Route::get('/conditions', [ProductApiController::class, 'conditions']);
    Route::get('/price-types', [ProductApiController::class, 'priceTypes']);
});
