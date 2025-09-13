# 📊 **Model & Database Reference Guide**

## **⚠️ Important Business Rules**

### **Featured Ads System:**
- **NO Admin Approval Required**: Users can mark their ads as featured based on their subscription plan's featured ads count
- **Subscription-Based**: Each subscription plan has a `featured_ads` limit that users can use
- **User Control**: Users select which of their ads to feature within their limit
- **Automatic**: Featured status is controlled by `is_featured` boolean field

---

## **🗄️ Database Tables Overview**

| Table Name | Purpose | Key Fields |
|------------|---------|------------|
| `users` | Regular users | `email`, `phone`, `bio_en/ar`, `name_en/ar`, `governate_id` |
| `admin_users` | Admin users | `name`, `email`, `permissions`, `is_active` |
| `ads` | Ad listings | `title_en/ar`, `description_en/ar`, `price`, `status` |
| `categories` | Ad categories | `name_en/ar`, `slug`, `icon_url`, `status` |
| `social_links` | Social media links | `platform`, `url`, `linkable_type/id`, `is_active` |
| `favorites` | User favorites | `user_id`, `ad_id` |
| `ad_views` | Ad view tracking | `ad_id`, `user_id`, `ip_address`, `viewed_at` |
| `banners` | Site banners | `image_url`, `link_url`, `position`, `status` |
| `ad_images` | Ad images | `ad_id`, `filename`, `url`, `is_primary` |
| `user_subscriptions` | User subscriptions | `user_id`, `plan_id`, `status`, `amount_paid` |
| `subscription_plans` | Subscription plans | `name_en/ar`, `price`, `ad_limit`, `status` |
| `price_types` | Price types | `name_en/ar`, `slug`, `is_active` |
| `governorates` | Kuwait governorates | `name_en/ar`, `slug`, `is_active` |
| `conditions` | Product conditions | `name_en/ar`, `slug`, `is_active`, `sort_order` |

---

## **👤 User Model**

### **Table: `users`**
```sql
- id (bigint, PK)
- email (varchar, unique, not null)
- email_verified_at (timestamp, nullable)
- password (varchar, not null)
- remember_token (varchar, nullable)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
- is_subscribed (boolean, not null)
- subscription_expires_at (timestamp, nullable)
- ads_count (integer, not null)
- featured_ads_count (integer, not null)
- phone (varchar, nullable)
- phone_whatsapp (varchar, nullable)
- bio_en (text, nullable)
- bio_ar (text, nullable)
- name_ar (text, nullable)
- name_en (text, nullable)
- profile_picture_url (varchar, nullable)
- governate_id (varchar, not null)
- profile_view_counts (integer, not null)
```

### **Model Attributes:**
```php
protected $fillable = [
    'email', 'password', 'phone', 'phone_whatsapp',
    'bio_en', 'bio_ar', 'name_ar', 'name_en',
    'profile_picture_url', 'governate_id', 'profile_view_counts',
    'is_subscribed', 'subscription_expires_at',
    'ads_count', 'featured_ads_count'
];

protected $casts = [
    'email_verified_at' => 'datetime',
    'password' => 'hashed',
    'subscription_expires_at' => 'datetime',
    'is_subscribed' => 'boolean',
    'ads_count' => 'integer',
    'featured_ads_count' => 'integer',
    'profile_view_counts' => 'integer'
];
```

### **Relationships:**
- `ads()` → hasMany(Ad::class)
- `subscriptions()` → hasMany(UserSubscription::class)
- `favorites()` → hasMany(Favorite::class)
- `adViews()` → hasMany(AdView::class)
- `adContacts()` → hasMany(AdContact::class)
- `socialLinks()` → morphMany(SocialLink::class, 'linkable')

---

## **👨‍💼 AdminUser Model**

### **Table: `admin_users`**
```sql
- id (bigint, PK)
- name (varchar, not null)
- email (varchar, unique, not null)
- email_verified_at (timestamp, nullable)
- password (varchar, not null)
- phone (varchar, nullable)
- avatar (varchar, nullable)
- permissions (json, nullable)
- is_active (boolean, not null)
- last_login_at (timestamp, nullable)
- last_login_ip (varchar, nullable)
- remember_token (varchar, nullable)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### **Model Attributes:**
```php
protected $fillable = [
    'name', 'email', 'password', 'phone', 'avatar',
    'permissions', 'is_active', 'last_login_at', 'last_login_ip'
];

protected $casts = [
    'email_verified_at' => 'datetime',
    'password' => 'hashed',
    'permissions' => 'array',
    'is_active' => 'boolean',
    'last_login_at' => 'datetime'
];
```

### **Relationships:**
- `socialLinks()` → morphMany(SocialLink::class, 'linkable')

---

## **📢 Ad Model**

### **Table: `ads`**
```sql
- id (bigint, PK)
- user_id (bigint, FK → users.id)
- category_id (bigint, FK → categories.id)
- title_en (varchar, not null)
- title_ar (varchar, not null)
- slug (varchar, not null)
- description_en (text, not null)
- description_ar (text, not null)
- product_details_en (text, nullable)
- product_details_ar (text, nullable)
- price (numeric, nullable)
- price_type_id (bigint, FK → price_types.id)
- condition_id (bigint, FK → conditions.id)
- governorate_id (bigint, FK → governorates.id)
- status (varchar, not null)
- delete_reason (varchar, nullable)
- is_featured (boolean, not null)
- is_negotiable (boolean, not null)
- is_approved (boolean, not null)
- views_count (integer, not null)
- contact_count (integer, not null)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### **Model Attributes:**
```php
protected $fillable = [
    'user_id', 'category_id', 'title_en', 'title_ar', 'slug',
    'description_en', 'description_ar', 'product_details_en', 'product_details_ar',
    'price', 'price_type_id', 'condition_id', 'governorate_id',
    'status', 'delete_reason', 'is_featured', 'is_negotiable',
    'is_approved', 'views_count', 'contact_count'
];

protected $casts = [
    'price' => 'decimal:2',
    'is_featured' => 'boolean',
    'is_negotiable' => 'boolean',
    'is_approved' => 'boolean',
    'views_count' => 'integer',
    'contact_count' => 'integer'
];
```

### **Relationships:**
- `user()` → belongsTo(User::class)
- `category()` → belongsTo(Category::class)
- `priceType()` → belongsTo(PriceType::class)
- `condition()` → belongsTo(Condition::class)
- `governorate()` → belongsTo(Governorate::class)
- `images()` → hasMany(AdImage::class)
- `primaryImage()` → hasOne(AdImage::class)->where('is_primary', true)
- `views()` → hasMany(AdView::class)
- `favorites()` → hasMany(Favorite::class)
- `contacts()` → hasMany(AdContact::class)

### **Scopes:**
- `scopeActive()` → where('status', 'active')
- `scopeFeatured()` → where('is_featured', true)
- `scopeByCategory($categoryId)` → where('category_id', $categoryId)
- `scopeByGovernorate($governorateId)` → where('governorate_id', $governorateId)

---

## **📂 Category Model**

### **Table: `categories`**
```sql
- id (bigint, PK)
- name_en (varchar, not null)
- name_ar (varchar, not null)
- slug (varchar, not null)
- icon_url (varchar, nullable)
- status (varchar, not null)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### **Model Attributes:**
```php
protected $fillable = [
    'name_en', 'name_ar', 'slug', 'icon_url', 'status'
];

protected $casts = [
    'status' => 'string'
];
```

### **Relationships:**
- `ads()` → hasMany(Ad::class)

### **Scopes:**
- `scopeActive()` → where('status', 'active')

---

## **🔗 SocialLink Model**

### **Table: `social_links`**
```sql
- id (bigint, PK)
- linkable_type (varchar, not null) // 'App\Models\User' or 'App\Models\AdminUser'
- linkable_id (bigint, not null)
- platform (varchar, not null) // 'facebook', 'instagram', 'twitter', etc.
- url (varchar, not null)
- is_active (boolean, not null, default: true)
- sort_order (integer, not null, default: 0)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### **Model Attributes:**
```php
protected $fillable = [
    'platform', 'url', 'is_active', 'sort_order'
];

protected $casts = [
    'is_active' => 'boolean',
    'sort_order' => 'integer'
];
```

### **Relationships:**
- `linkable()` → morphTo() // Polymorphic relationship

### **Scopes:**
- `scopeActive()` → where('is_active', true)
- `scopeByPlatform($platform)` → where('platform', $platform)
- `scopeOrdered()` → orderBy('sort_order')->orderBy('created_at')

### **Helper Methods:**
- `getDisplayUrlAttribute()` → Clean URL for display
- `getFullUrlAttribute()` → Full URL with protocol

---

## **❤️ Favorite Model**

### **Table: `favorites`**
```sql
- id (bigint, PK)
- user_id (bigint, FK → users.id)
- ad_id (bigint, FK → ads.id)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### **Model Attributes:**
```php
protected $fillable = [
    'user_id', 'ad_id'
];
```

### **Relationships:**
- `user()` → belongsTo(User::class)
- `ad()` → belongsTo(Ad::class)

---

## **👁️ AdView Model**

### **Table: `ad_views`**
```sql
- id (bigint, PK)
- ad_id (bigint, FK → ads.id)
- user_id (bigint, FK → users.id, nullable)
- ip_address (varchar, not null)
- user_agent (varchar, not null)
- referer (varchar, nullable)
- city (varchar, nullable)
- viewed_at (timestamp, not null)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### **Model Attributes:**
```php
protected $fillable = [
    'ad_id', 'user_id', 'ip_address', 'user_agent',
    'referer', 'city', 'viewed_at'
];

protected $casts = [
    'viewed_at' => 'datetime'
];
```

### **Relationships:**
- `ad()` → belongsTo(Ad::class)
- `user()` → belongsTo(User::class)

---

## **🎨 Banner Model**

### **Table: `banners`**
```sql
- id (bigint, PK)
- image_url (varchar, not null)
- link_url (varchar, nullable)
- position (varchar, not null) // 'top', 'sidebar', 'bottom', etc.
- status (varchar, not null) // 'active', 'inactive', 'pending'
- created_by (varchar, nullable)
- created_by_id (integer, nullable)
- is_approved (boolean, not null, default: false)
- click_count (integer, not null, default: 0)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### **Model Attributes:**
```php
protected $fillable = [
    'image_url', 'link_url', 'position', 'status',
    'created_by', 'created_by_id', 'is_approved', 'click_count'
];

protected $casts = [
    'is_approved' => 'boolean',
    'click_count' => 'integer',
    'created_by_id' => 'integer'
];
```

### **Scopes:**
- `scopeActive()` → where('status', 'active')
- `scopeApproved()` → where('is_approved', true)

---

## **🖼️ AdImage Model**

### **Table: `ad_images`**
```sql
- id (bigint, PK)
- ad_id (bigint, FK → ads.id)
- filename (varchar, not null)
- original_name (varchar, not null)
- path (varchar, not null)
- url (varchar, not null)
- mime_type (varchar, not null)
- file_size (integer, not null)
- is_primary (boolean, not null, default: false)
- sort_order (integer, not null, default: 0)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### **Model Attributes:**
```php
protected $fillable = [
    'ad_id', 'filename', 'original_name', 'path', 'url',
    'mime_type', 'file_size', 'is_primary', 'sort_order'
];

protected $casts = [
    'is_primary' => 'boolean',
    'file_size' => 'integer',
    'sort_order' => 'integer'
];
```

### **Relationships:**
- `ad()` → belongsTo(Ad::class)

### **Scopes:**
- `scopePrimary()` → where('is_primary', true)
- `scopeOrdered()` → orderBy('sort_order')

---

## **💳 UserSubscription Model**

### **Table: `user_subscriptions`**
```sql
- id (bigint, PK)
- user_id (bigint, FK → users.id)
- subscription_plan_id (bigint, FK → subscription_plans.id)
- status (varchar, not null) // 'active', 'cancelled', 'expired'
- starts_at (timestamp, not null)
- expires_at (timestamp, not null)
- cancelled_at (timestamp, nullable)
- payment_method (varchar, nullable)
- payment_id (varchar, nullable)
- amount_paid (numeric, not null)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### **Model Attributes:**
```php
protected $fillable = [
    'user_id', 'subscription_plan_id', 'status',
    'starts_at', 'expires_at', 'cancelled_at',
    'payment_method', 'payment_id', 'amount_paid'
];

protected $casts = [
    'starts_at' => 'datetime',
    'expires_at' => 'datetime',
    'cancelled_at' => 'datetime',
    'amount_paid' => 'decimal:2'
];
```

### **Relationships:**
- `user()` → belongsTo(User::class)
- `subscriptionPlan()` → belongsTo(SubscriptionPlan::class)

### **Scopes:**
- `scopeActive()` → where('status', 'active')
- `scopeExpired()` → where('expires_at', '<', now())

---

## **📋 SubscriptionPlan Model**

### **Table: `subscription_plans`**
```sql
- id (bigint, PK)
- name_en (varchar, not null)
- name_ar (varchar, not null)
- slug (varchar, not null)
- description_en (text, nullable)
- description_ar (text, nullable)
- price (numeric, not null)
- billing_cycle (varchar, not null) // 'monthly', 'yearly'
- ad_limit (integer, not null)
- featured_ads (integer, not null)
- featured_ads_count (integer, not null)
- has_unlimited_featured_ads (boolean, not null, default: false)
- priority_support (boolean, not null, default: false)
- analytics (boolean, not null, default: false)
- status (varchar, not null) // 'active', 'inactive'
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### **Model Attributes:**
```php
protected $fillable = [
    'name_en', 'name_ar', 'slug', 'description_en', 'description_ar',
    'price', 'billing_cycle', 'ad_limit', 'featured_ads', 'featured_ads_count',
    'has_unlimited_featured_ads', 'priority_support', 'analytics', 'status'
];

protected $casts = [
    'price' => 'decimal:2',
    'ad_limit' => 'integer',
    'featured_ads' => 'integer',
    'featured_ads_count' => 'integer',
    'has_unlimited_featured_ads' => 'boolean',
    'priority_support' => 'boolean',
    'analytics' => 'boolean'
];
```

### **Relationships:**
- `userSubscriptions()` → hasMany(UserSubscription::class)

### **Scopes:**
- `scopeActive()` → where('status', 'active')

---

## **💰 PriceType Model**

### **Table: `price_types`**
```sql
- id (bigint, PK)
- name_en (varchar, not null)
- name_ar (varchar, not null)
- slug (varchar, not null)
- is_active (boolean, not null, default: true)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### **Model Attributes:**
```php
protected $fillable = [
    'name_en', 'name_ar', 'slug', 'is_active'
];

protected $casts = [
    'is_active' => 'boolean'
];
```

### **Relationships:**
- `ads()` → hasMany(Ad::class)

### **Scopes:**
- `scopeActive()` → where('is_active', true)

---

## **🏛️ Governorate Model**

### **Table: `governorates`**
```sql
- id (bigint, PK)
- name_en (varchar, not null)
- name_ar (varchar, not null)
- slug (varchar, not null)
- is_active (boolean, not null, default: true)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### **Model Attributes:**
```php
protected $fillable = [
    'name_en', 'name_ar', 'slug', 'is_active'
];

protected $casts = [
    'is_active' => 'boolean'
];
```

### **Relationships:**
- `ads()` → hasMany(Ad::class)
- `users()` → hasMany(User::class)

### **Scopes:**
- `scopeActive()` → where('is_active', true)

---

## **📦 Condition Model**

### **Table: `conditions`**
```sql
- id (bigint, PK)
- name_en (varchar, not null)
- name_ar (varchar, not null)
- slug (varchar, not null)
- is_active (boolean, not null, default: true)
- sort_order (integer, not null, default: 0)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### **Model Attributes:**
```php
protected $fillable = [
    'name_en', 'name_ar', 'slug', 'is_active', 'sort_order'
];

protected $casts = [
    'is_active' => 'boolean',
    'sort_order' => 'integer'
];
```

### **Relationships:**
- `ads()` → hasMany(Ad::class)

### **Scopes:**
- `scopeActive()` → where('is_active', true)
- `scopeOrdered()` → orderBy('sort_order')

---

## **🔗 Key Relationships Summary**

### **User Relationships:**
- User → Ads (1:many)
- User → Subscriptions (1:many)
- User → Favorites (1:many)
- User → AdViews (1:many)
- User → SocialLinks (1:many, polymorphic)

### **Ad Relationships:**
- Ad → User (many:1)
- Ad → Category (many:1)
- Ad → PriceType (many:1)
- Ad → Condition (many:1)
- Ad → Governorate (many:1)
- Ad → Images (1:many)
- Ad → Views (1:many)
- Ad → Favorites (1:many)

### **Polymorphic Relationships:**
- SocialLink → User/AdminUser (polymorphic)

---

## **⚠️ Important Notes**

1. **Multilingual Support**: Most models support both English (`_en`) and Arabic (`_ar`) fields
2. **Soft Deletes**: Not implemented yet, but can be added if needed
3. **Timestamps**: All models use Laravel's default `created_at` and `updated_at` timestamps
4. **Foreign Keys**: All foreign key relationships are properly defined
5. **Casts**: Appropriate data type casting for booleans, integers, decimals, and dates
6. **Scopes**: Common query scopes for active records and ordering
7. **Fillable**: Mass assignment protection with appropriate fillable attributes

---

## **🚀 Usage Examples**

### **Creating Records:**
```php
// Create a user
$user = User::create([
    'email' => 'user@example.com',
    'password' => 'password',
    'name_en' => 'John Doe',
    'name_ar' => 'جون دو',
    'governate_id' => 1
]);

// Create an ad
$ad = Ad::create([
    'user_id' => $user->id,
    'category_id' => 1,
    'title_en' => 'iPhone 13 Pro',
    'title_ar' => 'آيفون 13 برو',
    'price' => 500.00,
    'status' => 'pending'
]);

// Create social links
$user->socialLinks()->create([
    'platform' => 'facebook',
    'url' => 'https://facebook.com/username',
    'is_active' => true
]);
```

### **Querying Records:**
```php
// Get active categories
$categories = Category::active()->get();

// Get featured ads
$featuredAds = Ad::featured()->with('user', 'category')->get();

// Get user's active subscription
$subscription = UserSubscription::where('user_id', $userId)->active()->first();

// Get social links for admin
$adminLinks = AdminUser::find(1)->socialLinks()->active()->ordered()->get();
```

This reference provides a complete overview of all models, their database tables, and relationships in your Laravel application.
