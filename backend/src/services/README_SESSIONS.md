# Session Management System

This session management system works alongside your existing JWT token system to provide enhanced session data structures and middleware.

## Features

### 1. **Session Data Structures**
- **Admin Sessions**: Enhanced data with permissions, dashboard preferences, admin level
- **Customer Sessions**: User preferences, recent activity, shopping cart data
- **Guest Sessions**: Temporary session data for non-authenticated users

### 2. **Middleware**
- `sessionAuth`: Enhanced authentication that works with existing JWT tokens
- `requireAdmin`: Admin-only access control
- `requireCustomer`: Customer-only access control
- `optionalAuth`: Allows both authenticated and guest users
- `rateLimit`: Rate limiting for API endpoints
- `trackActivity`: Activity tracking and logging

### 3. **Session Routes**
- `GET /api/sessions/me/info`: Get current session information
- `PUT /api/sessions/preferences`: Update session preferences
- `GET /api/sessions/stats`: Get session statistics (admin only)
- `POST /api/sessions/cleanup`: Clean up rate limits (admin only)

## Usage Examples

### Basic Route Protection
```javascript
// Require authentication
router.get('/protected', sessionAuth, (req, res) => {
    // req.user contains user data
    // req.session contains session data
    // req.isAuthenticated is true
});

// Admin only
router.get('/admin', sessionAuth, requireAdmin, (req, res) => {
    // Only admins can access
});

// Customer only
router.get('/customer', sessionAuth, requireCustomer, (req, res) => {
    // Only customers can access
});
```

### Rate Limiting
```javascript
// Limit login attempts to 5 per 15 minutes
router.post('/login', 
    rateLimit('login', 5, 15 * 60 * 1000), 
    userController.login
);

// Limit signup to 3 per hour
router.post('/signup', 
    rateLimit('signup', 3, 60 * 60 * 1000), 
    userController.createUser
);
```

### Activity Tracking
```javascript
// Track user actions
router.post('/order', 
    sessionAuth, 
    trackActivity('create_order'), 
    orderController.createOrder
);
```

### Session Data Access
```javascript
// In your controller
const someController = async (req, res) => {
    if (req.isAuthenticated) {
        // User is logged in
        console.log('User:', req.user.email);
        console.log('Role:', req.user.role);
        
        // Access session data
        if (req.session.preferences) {
            console.log('Language:', req.session.preferences.language);
        }
    } else {
        // Guest user
        console.log('Guest session:', req.session.sessionId);
    }
};
```

## Session Data Structure

### Admin Session
```javascript
{
    userId: "123",
    email: "admin@store.com",
    role: "admin",
    name: "Admin User",
    permissions: ["manage_products", "manage_orders", "manage_users", "view_analytics"],
    sessionId: "abc123...",
    lastLogin: "2024-01-15T10:30:00Z",
    isActive: true,
    adminLevel: "admin",
    dashboardPreferences: {
        defaultView: "orders",
        notifications: true,
        theme: "light"
    },
    createdAt: "2024-01-15T10:30:00Z",
    expiresAt: "2024-01-16T10:30:00Z"
}
```

### Customer Session
```javascript
{
    userId: "456",
    email: "customer@email.com",
    role: "customer",
    name: "John Doe",
    address: "123 Main St",
    phone_number: "+1234567890",
    sessionId: "def456...",
    lastLogin: "2024-01-15T10:30:00Z",
    isActive: true,
    preferences: {
        language: "en",
        currency: "USD",
        notifications: true,
        marketingConsent: true
    },
    recentActivity: {
        lastOrderDate: null,
        totalOrders: 0,
        totalSpent: 0
    },
    createdAt: "2024-01-15T10:30:00Z",
    expiresAt: "2024-01-22T10:30:00Z"
}
```

### Guest Session
```javascript
{
    sessionId: "ghi789...",
    isGuest: true,
    createdAt: "2024-01-15T10:30:00Z",
    lastActivity: "2024-01-15T10:30:00Z",
    cart: {
        items: [],
        total: 0,
        itemCount: 0
    },
    preferences: {
        language: "en",
        currency: "USD",
        location: "US"
    },
    browsingHistory: {
        viewedProducts: [],
        searchHistory: [],
        categoryViews: []
    },
    deviceInfo: {
        userAgent: "Mozilla/5.0...",
        ipAddress: "192.168.1.1",
        deviceType: "desktop"
    },
    expiresAt: "2024-01-15T12:30:00Z"
}
```

## Migration from Old System

1. **Replace `isAuthenticated` with `sessionAuth`** in routes that need session data
2. **Add rate limiting** to sensitive endpoints
3. **Add activity tracking** to important actions
4. **Use session data** instead of just user data where needed

## Security Features

- **Rate Limiting**: Prevents brute force attacks
- **Activity Tracking**: Logs user actions for security monitoring
- **Session Validation**: Ensures tokens are valid and not expired
- **Role-based Access**: Different access levels for different user types
- **Guest Session Support**: Handles non-authenticated users gracefully
