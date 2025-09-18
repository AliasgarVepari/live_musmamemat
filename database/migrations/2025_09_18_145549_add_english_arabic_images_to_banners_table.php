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
        Schema::table('banners', function (Blueprint $table) {
            $table->string('image_url_en')->nullable()->after('image_url');
            $table->string('image_url_ar')->nullable()->after('image_url_en');
            $table->dropColumn('link_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->string('link_url')->nullable();
            $table->dropColumn(['image_url_en', 'image_url_ar']);
        });
    }
};