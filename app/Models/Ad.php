<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ad extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'title_en',
        'title_ar',
        'slug',
        'description_en',
        'description_ar',
        'product_details_en',
        'product_details_ar',
        'price',
        'price_type_id',
        'condition_id',
        'governorate_id',
        'status',
        'delete_reason',
        'is_featured',
        'is_negotiable',
        'is_approved',
        'views_count',
        'contact_count',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_featured' => 'boolean',
            'is_negotiable' => 'boolean',
            'is_approved' => 'boolean',
            'views_count' => 'integer',
            'contact_count' => 'integer',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function priceType()
    {
        return $this->belongsTo(PriceType::class);
    }

    public function condition()
    {
        return $this->belongsTo(Condition::class);
    }

    public function governorate()
    {
        return $this->belongsTo(Governorate::class);
    }

    public function images()
    {
        return $this->hasMany(AdImage::class);
    }

    public function primaryImage()
    {
        return $this->hasOne(AdImage::class)->where('is_primary', true);
    }

    public function views()
    {
        return $this->hasMany(AdView::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function contacts()
    {
        return $this->hasMany(AdContact::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeByGovernorate($query, $governorateId)
    {
        return $query->where('governorate_id', $governorateId);
    }
}
