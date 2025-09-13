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
        'billing_cycle',
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
}
