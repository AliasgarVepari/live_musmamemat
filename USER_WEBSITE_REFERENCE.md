# User Website Development Reference

## General Guidelines

### 1. Design Preservation

- **DO NOT** change the design, even slightly
- The user website frontend is already created and finalized
- We only need to make it functional by handling state changes, API calls, and creating controllers
- Only update the design if explicitly requested

### 2. Functionality Focus

- Handle state changes
- Implement API calls
- Create necessary controllers
- Maintain existing UI/UX

### 3. Caching Strategy

- Use React Query caching mechanism
- Smartly cache product listings, categories, and other data requiring network calls
- Implement the same caching mechanism as the admin dashboard (ads, users, finance modules)
- Ensure blazing fast performance with proper cache invalidation

## Implementation Checklist

### Home Screen (/)

- [x] Social media links (FB, Instagram, Twitter, YouTube)
- [x] Top position banner implementation
- [x] Category display (4 categories with sort_order 1,2,3,4)
- [x] Migration for sort_order column in categories table
- [x] Admin category controllers update
- [x] Bottom position banner
- [x] Search functionality (product, brand, category)

### Product Listing Page (/products?category={slug})

- [x] Categories implementation
- [x] Products display by category
- [x] Pagination functionality
- [x] Filters implementation
- [x] Sort functionality
- [x] Search bar
- [x] Favourite functionality

### Product Details Page (/product/{product_id})

- [x] Search functionality with redirect to listing page
- [x] Product details and images display
- [x] Image carousel (hide arrows if < 2 images)
- [x] All product details as per design

### Profile Page (/profile)

- [x] Authentication check (login popup if not logged in)
- [x] Overview section metrics
- [x] Wishlist section
- [x] My Listings section with edit/delete functionality
- [x] Billing and transaction history
- [x] Subscription upgrade functionality
- [x] Settings and profile editing

## Technical Requirements

### React Query Implementation

- Smart caching for all data fetching
- Background refetching
- Cache invalidation on mutations
- Optimistic updates where appropriate

### Authentication

- Proper login/logout handling
- Protected routes
- Session management

### API Integration

- RESTful API calls
- Proper error handling
- Loading states
- Form submissions

### Performance

- Lazy loading for images
- Debounced search
- Optimized re-renders
- Efficient pagination

## File Structure

- Controllers: `app/Http/Controllers/User/`
- Routes: `routes/user.php`
- Frontend: `resources/js/pages/user/`
- Components: `resources/js/components/user/`
- Hooks: `resources/js/hooks/user/`

## Notes

- Maintain consistency with admin dashboard patterns
- Follow established coding standards
- Ensure responsive design works correctly
- Test all functionality thoroughly
