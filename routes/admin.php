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
        Route::patch('users/{user}/suspend', [App\Http\Controllers\Admin\UsersController::class, 'suspend'])->name('users.suspend');
        Route::post('users/{user}/revoke-subscription', [App\Http\Controllers\Admin\UsersController::class, 'revokeSubscription'])->name('users.revoke-subscription');
        Route::post('users/{user}/reactivate', [App\Http\Controllers\Admin\UsersController::class, 'reactivate'])->name('users.reactivate');
        Route::get('users-stats', [App\Http\Controllers\Admin\UsersController::class, 'getStats'])->name('users.stats');

        // Subscription Plans Management
        Route::resource('subscription-plans', App\Http\Controllers\Admin\SubscriptionPlansController::class);
        Route::patch('subscription-plans/{subscriptionPlan}/toggle', [App\Http\Controllers\Admin\SubscriptionPlansController::class, 'toggleStatus'])->name('subscription-plans.toggle');

        // Ads Management
        Route::resource('ads', App\Http\Controllers\Admin\AdController::class);
        Route::patch('ads/{ad}/toggle-status', [App\Http\Controllers\Admin\AdController::class, 'toggleStatus'])->name('ads.toggle-status');
        Route::patch('ads/{ad}/approve', [App\Http\Controllers\Admin\AdController::class, 'approve'])->name('ads.approve');
        Route::post('ads/{ad}/reject', [App\Http\Controllers\Admin\AdController::class, 'reject'])->name('ads.reject');
        Route::patch('ads/{ad}/mark-sold', [App\Http\Controllers\Admin\AdController::class, 'markAsSold'])->name('ads.mark-sold');
        Route::patch('ads/{ad}/mark-expired', [App\Http\Controllers\Admin\AdController::class, 'markAsExpired'])->name('ads.mark-expired');
        Route::post('ads/{ad}/mark-inactive', [App\Http\Controllers\Admin\AdController::class, 'markAsInactive'])->name('ads.mark-inactive');
        Route::post('ads/{ad}/delete', [App\Http\Controllers\Admin\AdController::class, 'delete'])->name('ads.delete');

        // Banners Management
        Route::resource('banners', App\Http\Controllers\Admin\BannerController::class);
        Route::patch('banners/{banner}/toggle', [App\Http\Controllers\Admin\BannerController::class, 'toggleStatus'])->name('banners.toggle');

        // Finance Management
        Route::get('finance', [App\Http\Controllers\Admin\FinanceController::class, 'index'])->name('finance.index');
        Route::get('finance/export', [App\Http\Controllers\Admin\FinanceController::class, 'exportCsv'])->name('finance.export');

        // System Maintenance
        Route::post('maintenance/cleanup-otps', function () {
            $deletedCount = \App\Models\PhoneOtp::cleanupExpired();
            return response()->json([
                'success' => true,
                'message' => "Cleaned up {$deletedCount} expired OTPs.",
                'deleted_count' => $deletedCount
            ]);
        })->name('admin.maintenance.cleanup-otps');
    });
    require __DIR__ . '/auth.php';
    require __DIR__ . '/settings.php';
});
