<?php

use App\Http\Controllers\Api\User\CategoriesController as ApiCategoriesController;
use App\Http\Controllers\Api\User\ConditionsController as ApiConditionsController;
use App\Http\Controllers\Api\User\GovernoratesController as ApiGovernoratesController;
use App\Http\Controllers\Api\User\PriceTypesController as ApiPriceTypesController;
use App\Http\Controllers\Api\User\ProductApiController as ApiProductsController;
use App\Http\Controllers\User\HomeController;
use App\Http\Controllers\User\ProductController;
use App\Http\Controllers\User\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('/')->group(function () {
    // Home page
    Route::get('/', [HomeController::class, 'index'])->name('user.home');

    // Search functionality
    Route::get('/search', [HomeController::class, 'search'])->name('user.search');
    Route::post('/search', [HomeController::class, 'search'])->name('user.search.post');

    // Product listing and details
    Route::get('/products', [ApiProductsController::class, 'index'])->name('user.products.index');
    Route::get('/product/{id}', [ProductController::class, 'show'])->whereNumber('id')->name('user.product.show');
    Route::get('/product/search', [ProductController::class, 'search'])->name('user.product.search');

    // Category listing (redirect to products with category filter)
    Route::get('/category/{slug}', function (string $slug) {
        return redirect()->route('user.products.index', ['category' => $slug]);
    })->name('user.category.show');

    // API routes for React Query
    Route::prefix('api')->group(function () {
        Route::get('/categories', [ApiCategoriesController::class, 'index'])->name('api.user.categories');
        Route::get('/governorates', [ApiGovernoratesController::class, 'index'])->name('api.user.governorates');
        Route::get('/conditions', [ApiConditionsController::class, 'index'])->name('api.user.conditions');
        Route::get('/price-types', [ApiPriceTypesController::class, 'index'])->name('api.user.price-types');
    });

    // Catch-all under /sell (e.g., /sell, /sell/step-1, /sell/anything/here)
    Route::get('/sell/{any?}', fn() => Inertia::render('user/SellWizard'))
        ->where('any', '.*')->name('user.sell');

    Route::get('/wishlist', fn() => Inertia::render('user/Wishlist'))
        ->name('user.wishlist');

    Route::get('/profile', [ProfileController::class, 'index'])->name('user.profile');
    Route::post('/profile', [ProfileController::class, 'update'])->name('user.profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('user.profile.avatar');
    Route::get('/profile/ads', [ProfileController::class, 'getAds'])->name('user.profile.ads');
    Route::get('/profile/wishlist', [ProfileController::class, 'getWishlist'])->name('user.profile.wishlist');
    Route::post('/profile/upgrade', [ProfileController::class, 'upgradeSubscription'])->name('user.profile.upgrade');
});
