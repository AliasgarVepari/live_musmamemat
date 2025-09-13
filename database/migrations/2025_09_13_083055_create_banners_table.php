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
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('image_url');
            $table->string('link_url')->nullable();
            $table->enum('position', ['top', 'middle', 'bottom', 'sidebar', 'popup'])->default('top');
            $table->enum('status', [ 'active', 'inactive', 'delete'])->default('active');
            $table->enum('created_by',['admin', 'user'])->default('admin');
            $table->integer('created_by_id');
            $table->boolean('is_approved')->default(false);
            $table->integer('click_count')->default(0);
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
