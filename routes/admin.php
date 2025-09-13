<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('admin')->group(function () {
    Route::get('/', function () {
        return Inertia::render('admin/welcome');
    })->name('admin.home');

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('admin/dashboard');
        })->name('admin.dashboard');
    });
    require __DIR__ . '/auth.php';
    require __DIR__ . '/settings.php';
});
