<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ad extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
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
        'reject_reason',
        'views_count',
        'contact_count',
        'created_at',
        'updated_at',
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

    protected $attributes = [
        'is_approved' => null,
    ];

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

    public function adImages()
    {
        return $this->hasMany(AdImage::class);
    }

    public function views()
    {
        return $this->hasMany(AdView::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
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

    // Workflow Methods
    public function canBeApproved(): bool
    {
        return $this->is_approved === null || $this->is_approved === false;
    }

    public function canBeRejected(): bool
    {
        return $this->is_approved === null || $this->is_approved === false;
    }

    public function canBeActivated(): bool
    {
        return in_array($this->status, ['inactive', 'expired', 'delete']);
    }

    public function canBeDeactivated(): bool
    {
        return in_array($this->status, ['active', 'expired']);
    }

    public function canBeMarkedAsSold(): bool
    {
        return $this->status === 'active' && $this->is_approved === true;
    }

    public function canBeMarkedAsExpired(): bool
    {
        return $this->status === 'active' && $this->is_approved === true;
    }

    public function canBeMarkedAsInactive(): bool
    {
        return $this->status === 'active' && $this->is_approved === true;
    }

    public function canBeDeleted(): bool
    {
        return $this->status !== 'sold';
    }

    public function isInFinalState(): bool
    {
        return $this->status === 'sold';
    }

    public function isPendingApproval(): bool
    {
        return $this->status === 'active' && $this->is_approved === null;
    }

    public function isApproved(): bool
    {
        return $this->is_approved === true;
    }

    public function isRejected(): bool
    {
        return $this->is_approved === false;
    }
}
