<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('admin')->group(function () {
    Route::get('/', function () {
        return Inertia::render('admin/welcome');
    })->name('admin.home');

    Route::middleware(['admin.auth'])->group(function () {
        Route::get('dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('admin.dashboard');

        // Master Module Routes
        Route::prefix('master')->name('master.')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\MasterModuleController::class, 'index'])->name('index');
        });

        // Social Links Management
        Route::resource('social-links', App\Http\Controllers\Admin\SocialLinksController::class);
        Route::patch('social-links/{socialLink}/toggle', [App\Http\Controllers\Admin\SocialLinksController::class, 'toggle'])->name('social-links.toggle');

        // Governorates Management
        Route::resource('governorates', App\Http\Controllers\Admin\GovernoratesController::class);
        Route::patch('governorates/{governorate}/toggle', [App\Http\Controllers\Admin\GovernoratesController::class, 'toggle'])->name('governorates.toggle');

        // Conditions Management
        Route::resource('conditions', App\Http\Controllers\Admin\ConditionsController::class);
        Route::patch('conditions/{condition}/toggle', [App\Http\Controllers\Admin\ConditionsController::class, 'toggle'])->name('conditions.toggle');

        // Price Types Management
        Route::resource('price-types', App\Http\Controllers\Admin\PriceTypesController::class);
        Route::patch('price-types/{priceType}/toggle', [App\Http\Controllers\Admin\PriceTypesController::class, 'toggle'])->name('price-types.toggle');

        // Categories Management
        Route::resource('categories', App\Http\Controllers\Admin\CategoriesController::class);
        Route::patch('categories/{category}/toggle', [App\Http\Controllers\Admin\CategoriesController::class, 'toggle'])->name('categories.toggle');

        // Users Management
        Route::resource('users', App\Http\Controllers\Admin\UsersController::class);
        Route::patch('users/{user}/toggle', [App\Http\Controllers\Admin\UsersController::class, 'toggle'])->name('users.toggle');
        Route::post('users/{user}/revoke-subscription', [App\Http\Controllers\Admin\UsersController::class, 'revokeSubscription'])->name('users.revoke-subscription');
        Route::post('users/{user}/reactivate', [App\Http\Controllers\Admin\UsersController::class, 'reactivate'])->name('users.reactivate');
        Route::get('users-stats', [App\Http\Controllers\Admin\UsersController::class, 'getStats'])->name('users.stats');

        // Subscription Plans Management
        Route::resource('subscription-plans', App\Http\Controllers\Admin\SubscriptionPlansController::class);
        Route::patch('subscription-plans/{subscriptionPlan}/toggle', [App\Http\Controllers\Admin\SubscriptionPlansController::class, 'toggleStatus'])->name('subscription-plans.toggle');

        // Ads Management
        Route::resource('ads', App\Http\Controllers\Admin\AdController::class);
        Route::patch('ads/{ad}/toggle-status', [App\Http\Controllers\Admin\AdController::class, 'toggleStatus'])->name('ads.toggle-status');
        Route::patch('ads/{ad}/toggle-featured', [App\Http\Controllers\Admin\AdController::class, 'toggleFeatured'])->name('ads.toggle-featured');
        Route::patch('ads/{ad}/toggle-approval', [App\Http\Controllers\Admin\AdController::class, 'toggleApproval'])->name('ads.toggle-approval');
    });
    require __DIR__ . '/auth.php';
    require __DIR__ . '/settings.php';
});
