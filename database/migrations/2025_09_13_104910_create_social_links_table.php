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
        Schema::create('social_links', function (Blueprint $table) {
            $table->id();
            $table->morphs('linkable'); // Polymorphic relationship (user_id, linkable_type)
            $table->string('platform'); // facebook, instagram, twitter, youtube, linkedin, tiktok, etc.
            $table->string('url');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            // Indexes
            $table->index(['linkable_type', 'linkable_id'], 'social_links_linkable_index');
            $table->index(['platform', 'is_active'], 'social_links_platform_active_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_links');
    }
};
