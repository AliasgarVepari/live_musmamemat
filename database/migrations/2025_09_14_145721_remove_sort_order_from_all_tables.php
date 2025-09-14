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
        // Remove sort_order from conditions table
        Schema::table('conditions', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });

        // Remove sort_order from social_links table
        Schema::table('social_links', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });

        // Remove sort_order from ad_images table
        Schema::table('ad_images', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add sort_order back to conditions table
        Schema::table('conditions', function (Blueprint $table) {
            $table->integer('sort_order')->default(0);
        });

        // Add sort_order back to social_links table
        Schema::table('social_links', function (Blueprint $table) {
            $table->integer('sort_order')->default(0);
        });

        // Add sort_order back to ad_images table
        Schema::table('ad_images', function (Blueprint $table) {
            $table->integer('sort_order')->default(0);
        });
    }
};