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
            // Rename existing image_url to image_url_en
            $table->dropColumn('image_url');

            // Add new image_url_ar column
            $table->string('image_url')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            // Rename image_url_en back to image_url
            $table->renameColumn('image_url_en', 'image_url');

            // Drop image_url_ar column
            $table->dropColumn('image_url_ar');
        });
    }
};
