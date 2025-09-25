<?php

namespace App\Console\Commands;

use App\Models\Ad;
use App\Models\UserSubscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpireSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:expire {--dry-run : Show what would be expired without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire subscriptions that have passed their expiry date and remove featured status from their ads';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        
        if ($isDryRun) {
            $this->info('🔍 DRY RUN MODE - No changes will be made');
            $this->newLine();
        }

        // Get all active subscriptions that have expired (excluding lifetime subscriptions)
        $expiredSubscriptions = UserSubscription::with(['user', 'subscriptionPlan'])
            ->where('status', 'active')
            ->where('is_active', true)
            ->where('expires_at', '<=', now())
            ->whereHas('subscriptionPlan', function ($query) {
                $query->where('is_lifetime', false);
            })
            ->get();

        if ($expiredSubscriptions->isEmpty()) {
            $this->info('✅ No expired subscriptions found');
            return 0;
        }

        $this->info("📊 Found {$expiredSubscriptions->count()} expired subscriptions");
        $this->newLine();

        $expiredCount = 0;
        $totalFeaturedAdsRemoved = 0;

        foreach ($expiredSubscriptions as $subscription) {
            $userName = $subscription->user->name_en ?? 'Unknown User';
            $planName = $subscription->subscriptionPlan->name_en ?? 'Unknown Plan';
            $expiryDate = $subscription->expires_at->format('Y-m-d H:i:s');

            // Count featured ads for this user
            $featuredAdsCount = Ad::where('user_id', $subscription->user_id)
                ->where('is_featured', true)
                ->count();

            if ($isDryRun) {
                $this->line("🔄 Would expire: {$userName} ({$planName}) - Expired: {$expiryDate}");
                if ($featuredAdsCount > 0) {
                    $this->line("   📌 Would remove featured status from {$featuredAdsCount} ads");
                }
            } else {
                // Use database transaction to ensure data consistency
                DB::transaction(function () use ($subscription, $userName, $planName, $expiryDate, $featuredAdsCount) {
                    // Expire the subscription
                    $subscription->update([
                        'status' => 'expired',
                        'is_active' => false,
                    ]);

                    // Remove featured status from all user's ads
                    if ($featuredAdsCount > 0) {
                        Ad::where('user_id', $subscription->user_id)
                            ->where('is_featured', true)
                            ->update(['is_featured' => false]);
                    }

                    $this->line("✅ Expired: {$userName} ({$planName}) - Expired: {$expiryDate}");
                    if ($featuredAdsCount > 0) {
                        $this->line("   📌 Removed featured status from {$featuredAdsCount} ads");
                    }
                });
            }

            $expiredCount++;
            $totalFeaturedAdsRemoved += $featuredAdsCount;
        }

        $this->newLine();
        
        if ($isDryRun) {
            $this->info("🔍 DRY RUN SUMMARY:");
            $this->info("   • {$expiredCount} subscriptions would be expired");
            $this->info("   • {$totalFeaturedAdsRemoved} featured ads would be updated");
        } else {
            $this->info("✅ SUBSCRIPTION EXPIRATION COMPLETED:");
            $this->info("   • {$expiredCount} subscriptions expired");
            $this->info("   • {$totalFeaturedAdsRemoved} featured ads updated");
        }

        return 0;
    }
}
