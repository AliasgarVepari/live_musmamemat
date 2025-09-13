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
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('slug')->unique();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->decimal('price', 10, 2);
            $table->enum('billing_cycle', ['monthly', 'yearly', 'lifetime']);
            $table->integer('ad_limit')->default(0); // 0 = unlimited
            $table->integer('featured_ads')->default(0);
            $table->integer('featured_ads_count')->default(0);
            $table->boolean('has_unlimited_featured_ads')->default(false);
            $table->boolean('priority_support')->default(false);
            $table->boolean('analytics')->default(false);
            $table->enum('status', ['active', 'inactive', 'delete'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};
