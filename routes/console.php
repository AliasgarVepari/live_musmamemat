<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule monthly ad allowance reset on the 1st of every month at 00:00
Schedule::command('subscriptions:reset-ad-allowances')
    ->monthly()
    ->at('00:00')
    ->description('Reset monthly ad allowances for all active subscriptions');

// Schedule daily subscription expiration check at 01:00
Schedule::command('subscriptions:expire')
    ->daily()
    ->at('01:00')
    ->description('Expire subscriptions and remove featured status from ads');
