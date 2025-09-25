<?php

namespace App\Console\Commands;

use App\Models\UserSubscription;
use Illuminate\Console\Command;

class ResetMonthlyAdAllowances extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:reset-ad-allowances {--dry-run : Show what would be updated without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset monthly ad allowances for all active subscriptions';

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

        // Get all active subscriptions that need monthly reset (excluding lifetime subscriptions)
        $subscriptions = UserSubscription::with(['subscriptionPlan', 'user'])
            ->where('status', 'active')
            ->where('is_active', true)
            ->where('expires_at', '>', now())
            ->whereHas('subscriptionPlan', function ($query) {
                $query->where('is_lifetime', false);
            })
            ->get()
            ->filter(function ($subscription) {
                return $subscription->needsMonthlyReset();
            });

        if ($subscriptions->isEmpty()) {
            $this->info('✅ No subscriptions need monthly allowance reset');
            return 0;
        }

        $this->info("📊 Found {$subscriptions->count()} subscriptions that need monthly allowance reset");
        $this->newLine();

        $updatedCount = 0;
        $totalAllowance = 0;

        foreach ($subscriptions as $subscription) {
            $adLimit = $subscription->subscriptionPlan->ad_limit ?? 0;
            $userName = $subscription->user->name_en ?? 'Unknown User';
            $planName = $subscription->subscriptionPlan->name_en ?? 'Unknown Plan';

            if ($isDryRun) {
                $this->line("🔄 Would reset: {$userName} ({$planName}) - {$adLimit} ads");
            } else {
                $subscription->resetMonthlyAllowance();
                $this->line("✅ Reset: {$userName} ({$planName}) - {$adLimit} ads");
            }

            $updatedCount++;
            $totalAllowance += $adLimit;
        }

        $this->newLine();
        
        if ($isDryRun) {
            $this->info("🔍 DRY RUN SUMMARY:");
            $this->info("   • {$updatedCount} subscriptions would be updated");
            $this->info("   • {$totalAllowance} total ad allowances would be granted");
        } else {
            $this->info("✅ MONTHLY RESET COMPLETED:");
            $this->info("   • {$updatedCount} subscriptions updated");
            $this->info("   • {$totalAllowance} total ad allowances granted");
        }

        return 0;
    }
}
