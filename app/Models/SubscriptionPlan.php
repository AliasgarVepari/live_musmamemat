<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name_en',
        'name_ar',
        'slug',
        'description_en',
        'description_ar',
        'price',
        'months_count',
        'is_lifetime',
        'readable_billing_cycle',
        'ad_limit',
        'featured_ads',
        'featured_ads_count',
        'has_unlimited_featured_ads',
        'priority_support',
        'analytics',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'months_count' => 'integer',
            'is_lifetime' => 'boolean',
            'ad_limit' => 'integer',
            'featured_ads' => 'integer',
            'featured_ads_count' => 'integer',
            'has_unlimited_featured_ads' => 'boolean',
            'priority_support' => 'boolean',
            'analytics' => 'boolean',
        ];
    }

    // Relationships
    public function userSubscriptions()
    {
        return $this->hasMany(UserSubscription::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Helper methods
    public function generateReadableBillingCycle()
    {
        if ($this->is_lifetime) {
            return 'Lifetime';
        }

        if ($this->months_count == 1) {
            return 'Monthly';
        } elseif ($this->months_count == 12) {
            return 'Yearly';
        } elseif ($this->months_count > 0) {
            $years = floor($this->months_count / 12);
            $months = $this->months_count % 12;
            
            if ($years > 0 && $months > 0) {
                return $years . ' year' . ($years > 1 ? 's' : '') . ' ' . $months . ' month' . ($months > 1 ? 's' : '');
            } elseif ($years > 0) {
                return $years . ' year' . ($years > 1 ? 's' : '');
            } else {
                return $this->months_count . ' month' . ($this->months_count > 1 ? 's' : '');
            }
        }

        return 'Custom';
    }
}
