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
        Schema::table('subscription_plans', function (Blueprint $table) {
            // Add new columns
            $table->integer('months_count')->default(0)->after('price');
            $table->boolean('is_lifetime')->default(false)->after('months_count');
            $table->string('readable_billing_cycle')->nullable()->after('is_lifetime');
            
            // Drop the old billing_cycle enum column
            $table->dropColumn('billing_cycle');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            // Add back the old billing_cycle column
            $table->enum('billing_cycle', ['monthly', 'yearly', 'lifetime'])->default('monthly');
            
            // Drop the new columns
            $table->dropColumn(['months_count', 'is_lifetime', 'readable_billing_cycle']);
        });
    }
};