<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialLink extends Model
{
    protected $fillable = [
        'platform',
        'url',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }


    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByPlatform($query, $platform)
    {
        return $query->where('platform', $platform);
    }


    // Helper methods
    public function getDisplayUrlAttribute()
    {
        // Clean up URL for display
        $url = $this->url;
        
        // Remove protocol if present
        $url = preg_replace('/^https?:\/\//', '', $url);
        
        // Remove www. if present
        $url = preg_replace('/^www\./', '', $url);
        
        return $url;
    }

    public function getFullUrlAttribute()
    {
        $url = $this->url;
        
        // Add protocol if not present
        if (!preg_match('/^https?:\/\//', $url)) {
            $url = 'https://' . $url;
        }
        
        return $url;
    }
}
