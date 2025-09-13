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
        Schema::create('ads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('title_en');
            $table->string('title_ar');
            $table->string('slug')->unique();
            $table->text('description_en');
            $table->text('description_ar');
            // Product details to be displayed as bullet points or text
            $table->text('product_details_en')->nullable();
            $table->text('product_details_ar')->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->foreignId('price_type_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('condition_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('governorate_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('status', ['draft', 'active', 'inactive', 'expired', 'sold', 'delete'])->default('draft');
            //when the admin deletes the ad then it will be delete if the user deletes then ad then it will be expired
            $table->string('delete_reason')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_negotiable')->default(false);
            $table->boolean('is_approved')->default(false);
            $table->integer('views_count')->default(0);
            $table->integer('contact_count')->default(0);
            $table->timestamps();
            
            // Index for quick lookup of featured ads by status
            $table->index(['status', 'is_featured']);

            // Index for filtering ads by category and status
            $table->index(['category_id', 'status']);

            // Index for filtering ads by user and status
            $table->index(['user_id', 'status']);

            // Index for filtering ads by governorate and status
            $table->index(['governorate_id', 'status']);

            // Index for filtering ads by price and status
            $table->index(['price', 'status']);

            // Index for sorting/filtering by creation date
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ads');
    }
};
