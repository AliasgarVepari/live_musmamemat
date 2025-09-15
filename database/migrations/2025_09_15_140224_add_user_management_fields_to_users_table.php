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
            $table->string('status')->default('active')->after('id');
            $table->text('suspension_reason')->nullable()->after('status');
            $table->text('deletion_reason')->nullable()->after('suspension_reason');
            $table->timestamp('deleted_at')->nullable()->after('deletion_reason');
            
            // Rename the existing column if it exists
            if (Schema::hasColumn('users', 'governate_id')) {
                $table->renameColumn('governate_id', 'governorate_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'suspension_reason',
                'deletion_reason',
                'deleted_at'
            ]);
            
            // Rename back if needed
            if (Schema::hasColumn('users', 'governorate_id')) {
                $table->renameColumn('governorate_id', 'governate_id');
            }
        });
    }
};