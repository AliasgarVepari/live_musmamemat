<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'password',
        'phone',
        'phone_whatsapp',
        'bio_en',
        'bio_ar',
        'name_ar',
        'name_en',
        'profile_picture_url',
        'governate_id',
        'profile_view_counts',
        'is_subscribed',
        'subscription_expires_at',
        'ads_count',
        'featured_ads_count',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'subscription_expires_at' => 'datetime',
            'is_subscribed' => 'boolean',
            'ads_count' => 'integer',
            'featured_ads_count' => 'integer',
            'profile_view_counts' => 'integer',
        ];
    }

    // Relationships
    public function ads()
    {
        return $this->hasMany(Ad::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(UserSubscription::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function adViews()
    {
        return $this->hasMany(AdView::class);
    }

    public function adContacts()
    {
        return $this->hasMany(AdContact::class);
    }


    public function governorate()
    {
        return $this->belongsTo(Governorate::class, 'governate_id');
    }
}
