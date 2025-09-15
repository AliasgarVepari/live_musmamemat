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
        Schema::table('user_subscriptions', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('status');
            $table->timestamp('revoked_at')->nullable()->after('cancelled_at');
            $table->text('revocation_reason')->nullable()->after('revoked_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_subscriptions', function (Blueprint $table) {
            $table->dropColumn([
                'is_active',
                'revoked_at',
                'revocation_reason'
            ]);
        });
    }
};