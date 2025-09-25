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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_plan_id')->constrained()->onDelete('cascade');
            $table->string('transaction_id')->unique(); // External payment gateway transaction ID
            $table->string('type')->default('subscription'); // subscription, upgrade, renewal
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('KWD');
            $table->string('payment_method')->default('manual'); // manual, credit_card, bank_transfer, etc.
            $table->string('payment_gateway')->nullable(); // stripe, paypal, knet, etc.
            $table->string('status')->default('pending'); // pending, completed, failed, refunded
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Additional data like ad_id, upgrade_details, etc.
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
