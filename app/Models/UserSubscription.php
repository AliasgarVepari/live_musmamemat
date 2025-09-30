<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSubscription extends Model
{
    protected $fillable = [
        'user_id',
        'subscription_plan_id',
        'status',
        'is_active',
        'usable_ad_for_this_month',
        'last_allowance_reset',
        'starts_at',
        'expires_at',
        'cancelled_at',
        'revoked_at',
        'revocation_reason',
        'payment_method',
        'payment_id',
        'amount_paid',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'revoked_at' => 'datetime',
            'last_allowance_reset' => 'datetime',
            'is_active' => 'boolean',
            'amount_paid' => 'decimal:2',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subscriptionPlan()
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }

    // Helper methods for ad allowance management
    public function canCreateAd(): bool
    {
        return $this->is_active && 
               $this->expires_at > now() && 
               $this->usable_ad_for_this_month > 0;
    }

    public function deductAdAllowance(): bool
    {
        if (!$this->canCreateAd()) {
            return false;
        }

        $this->decrement('usable_ad_for_this_month');
        return true;
    }

    public function resetMonthlyAllowance(): void
    {
        if ($this->subscriptionPlan) {
            $this->update([
                'usable_ad_for_this_month' => $this->usable_ad_for_this_month + ($this->subscriptionPlan->ad_limit ?? 0),
                'last_allowance_reset' => now(),
            ]);
        }
    }

    public function needsMonthlyReset(): bool
    {
        if (!$this->last_allowance_reset) {
            return true;
        }

        return $this->last_allowance_reset->month !== now()->month || 
               $this->last_allowance_reset->year !== now()->year;
    }
}
