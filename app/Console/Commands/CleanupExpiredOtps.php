<?php

namespace App\Console\Commands;

use App\Models\PhoneOtp;
use Illuminate\Console\Command;

class CleanupExpiredOtps extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'otps:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up expired OTPs from the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $deletedCount = PhoneOtp::cleanupExpired();
        
        $this->info("Cleaned up {$deletedCount} expired OTPs.");
        
        return Command::SUCCESS;
    }
}
