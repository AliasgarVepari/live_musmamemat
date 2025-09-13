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
        Route::patch('conditions/update-order', [App\Http\Controllers\Admin\ConditionsController::class, 'updateOrder'])->name('conditions.update-order');
        
        // Price Types Management
        Route::resource('price-types', App\Http\Controllers\Admin\PriceTypesController::class);
        Route::patch('price-types/{priceType}/toggle', [App\Http\Controllers\Admin\PriceTypesController::class, 'toggle'])->name('price-types.toggle');
    });
    require __DIR__ . '/auth.php';
    require __DIR__ . '/settings.php';
});
