<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Contracts\Factory as SocialiteFactory;
use SocialiteProviders\Apple\Provider as AppleProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Apple provider for Socialite if Socialite is installed
        $this->app->resolving(SocialiteFactory::class, function (SocialiteFactory $socialite) {
            $socialite->extend('apple', function ($app) use ($socialite) {
                $config = $app['config']['services.apple'];
                return $socialite->buildProvider(AppleProvider::class, $config);
            });
        });
    }
}
