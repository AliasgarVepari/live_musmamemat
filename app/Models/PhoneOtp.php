<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PhoneOtp extends Model
{
    use HasFactory;

    protected $fillable = [
        'phone',
        'otp',
        'provider_user_id',
        'expires_at',
        'is_used',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'is_used' => 'boolean',
        ];
    }

    /**
     * Check if OTP is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Mark OTP as used
     */
    public function markAsUsed(): void
    {
        $this->update(['is_used' => true]);
    }

    /**
     * Find valid OTP for phone and OTP code
     */
    public static function findValid(string $phone, string $otp, ?string $providerUserId = null): ?self
    {
        $query = self::where('phone', $phone)
            ->where('otp', $otp)
            ->where('is_used', false)
            ->where('expires_at', '>', now());

        // If provider_user_id is provided, match it; otherwise find any valid OTP for the phone
        if ($providerUserId) {
            $query->where('provider_user_id', $providerUserId);
        }

        return $query->first();
    }

    /**
     * Clean up expired OTPs
     */
    public static function cleanupExpired(): int
    {
        return self::where('expires_at', '<', now())->delete();
    }
}
