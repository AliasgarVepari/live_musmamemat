<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_subscriptions', function (Blueprint $table) {
            $table->integer('usable_ad_for_this_month')->default(0)->after('is_active');
            $table->timestamp('last_allowance_reset')->nullable()->after('usable_ad_for_this_month');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_subscriptions', function (Blueprint $table) {
            $table->dropColumn(['usable_ad_for_this_month', 'last_allowance_reset']);
        });
    }
};
