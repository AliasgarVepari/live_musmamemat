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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_subscribed')->default(false);
            $table->timestamp('subscription_expires_at')->nullable();
            $table->integer('ads_count')->default(0);
            $table->integer('featured_ads_count')->default(0);
            $table->string('phone')->nullable();
            $table->string('phone_whatsapp')->nullable();
            $table->text('bio_en')->nullable();
            $table->text('bio_ar')->nullable();
            $table->text('name_ar')->nullable();
            $table->text('name_en')->nullable();
            $table->string('profile_picture_url')->nullable();
            $table->string('governate_id');
            $table->integer('profile_view_counts')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'is_subscribed',
                'subscription_expires_at',
                'ads_count',
                'featured_ads_count',
                'phone',
                'bio',
                'avatar',
                'location',
                'website',
                'preferences'
            ]);
        });
    }
};
