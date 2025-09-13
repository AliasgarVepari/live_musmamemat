<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('/')->group(function () {
    // Route::get('/', fn() => Inertia::render('user/Index'));
    // Route::get('/products', fn() => Inertia::render('user/ProductListing'));
    // Route::get('/category/:slug', fn() => Inertia::render('user/CategoryListing'));
    // Route::get('/product/:id', fn() => Inertia::render('user/ProductDetail'));
    // Route::get('/sell/*', fn() => Inertia::render('user/SellWizard'));
    // Route::get('/wishlist', fn() => Inertia::render('user/Wishlist'));
    // Route::get('/profile', fn() => Inertia::render('user/Profile'));
    // Route::get('/search', fn() => Inertia::render('user/Search'));

    // Public/user site
    Route::get('/', fn() => Inertia::render('user/Index'))
        ->name('user.home');

    Route::get('/products', function (Request $request) {
        // Read query param: ?category=all
        $category = $request->query('category', 'all'); // default to 'all' if missing

        return Inertia::render('user/ProductListing', [
            'category' => $category,
        ]);
    })->name('user.products.index');

    Route::get('/category/{slug}', fn(string $slug) => Inertia::render('user/CategoryListing', [
        'slug' => $slug,
    ]))->name('user.category.show');

    Route::get('/product/{id}', fn(int $id) => Inertia::render('user/ProductDetail', [
        'id' => $id,
    ]))->whereNumber('id')->name('user.product.show');

    // Catch-all under /sell (e.g., /sell, /sell/step-1, /sell/anything/here)
    Route::get('/sell/{any?}', fn() => Inertia::render('user/SellWizard'))
        ->where('any', '.*')->name('user.sell');

    Route::get('/wishlist', fn() => Inertia::render('user/Wishlist'))
    // ->middleware(['auth', 'verified']) // if wishlist requires auth; remove if public
        ->name('user.wishlist');

    Route::get('/profile', fn() => Inertia::render('user/Profile'))
    // ->middleware(['auth', 'verified']) // usually protected
        ->name('user.profile');

    Route::get('/search', fn() => Inertia::render('user/Search'))
        ->name('user.search');

});
