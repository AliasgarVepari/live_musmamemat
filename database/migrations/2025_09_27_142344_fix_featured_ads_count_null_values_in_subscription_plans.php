<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fix any existing null values in featured_ads_count column
        // When has_unlimited_featured_ads is true, set featured_ads_count to 0
        // When has_unlimited_featured_ads is false, set featured_ads_count to featured_ads value
        DB::table('subscription_plans')
            ->whereNull('featured_ads_count')
            ->update([
                'featured_ads_count' => DB::raw('CASE 
                    WHEN has_unlimited_featured_ads = true THEN 0 
                    ELSE featured_ads 
                END')
            ]);

        // Ensure the column is not nullable going forward
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->integer('featured_ads_count')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Make the column nullable again (reverting the change)
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->integer('featured_ads_count')->nullable()->change();
        });
    }
};
