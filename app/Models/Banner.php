<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'image_url',
        'link_url',
        'position',
        'status',
        'created_by',
        'created_by_id',
        'is_approved',
        'click_count',
    ];

    protected function casts(): array
    {
        return [
            'is_approved' => 'boolean',
            'click_count' => 'integer',
            'created_by_id' => 'integer',
        ];
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }
}
