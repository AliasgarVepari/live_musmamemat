<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdImage extends Model
{
    protected $fillable = [
        'ad_id',
        'filename',
        'original_name',
        'path',
        'url',
        'mime_type',
        'file_size',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'file_size' => 'integer',
        ];
    }

    // Relationships
    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }

    // Scopes
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

}
