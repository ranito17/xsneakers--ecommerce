// backend/src/services/sessionService.js
const crypto = require('crypto');

class SessionService {
    // Generate unique session ID
    generateSessionId() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Create admin session data for server-side storage
    createAdminSessionData(user) {
        return {
            userId: user.id,
            email: user.email,
            role: 'admin',
            name: user.full_name,
            adminLevel: user.adminLevel || 'admin',
            dashboardPreferences: {
                defaultView: 'orders',
                notifications: true,
                theme: 'light'
            },
            lastLogin: new Date().toISOString(),
            isActive: true,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        };
    }

    // Create customer session data for server-side storage
    createCustomerSessionData(user) {
        return {
            userId: user.id,
            email: user.email,
            role: 'customer',
            name: user.full_name,
            address: user.address,
            phone_number: user.phone_number,
            preferences: {
                language: 'en',
                currency: 'USD',
                notifications: true,
                marketingConsent: true
            },
            recentActivity: {
                lastOrderDate: null,
                totalOrders: 0,
                totalSpent: 0
            },
            lastLogin: new Date().toISOString(),
            isActive: true,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        };
    }

    // Create guest session data for server-side storage
    createGuestSessionData(req) {
        return {
            isGuest: true,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            cart: {
                items: [],
                total: 0,
                itemCount: 0
            },
            preferences: {
                language: 'en',
                currency: 'USD',
                location: this.getLocationFromIP(req.ip)
            },
            browsingHistory: {
                viewedProducts: [],
                searchHistory: [],
                categoryViews: []
            },
            deviceInfo: {
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip,
                deviceType: this.getDeviceType(req.headers['user-agent'])
            },
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
        };
    }

    // Store session data in server-side session
    storeSessionData(req, sessionData) {
        req.session.userData = sessionData;
        req.session.isAuthenticated = true;
        req.session.lastActivity = new Date().toISOString();
        
        // Save session immediately
        return new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(req.sessionID);
                }
            });
        });
    }

    // Get session data from server-side session
    getSessionData(req) {
        return req.session.userData || null;
    }

    // Check if session is authenticated
    isAuthenticated(req) {
        return req.session.isAuthenticated === true;
    }

    // Check if user has admin role
    isAdmin(req) {
        const sessionData = this.getSessionData(req);
        return sessionData && sessionData.role === 'admin';
    }

    // Check if user has customer role
    isCustomer(req) {
        const sessionData = this.getSessionData(req);
        return sessionData && sessionData.role === 'customer';
    }

    // Update session data
    updateSessionData(req, updates) {
        if (req.session.userData) {
            req.session.userData = { ...req.session.userData, ...updates };
            req.session.lastActivity = new Date().toISOString();
            return true;
        }
        return false;
    }

    // Destroy session
    destroySession(req) {
        return new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    // Regenerate session (for security)
    regenerateSession(req) {
        return new Promise((resolve, reject) => {
            req.session.regenerate((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(req.sessionID);
                }
            });
        });
    }

    // Helper methods
    getLocationFromIP(ip) {
        // In production, you might want to use a geolocation service
        return 'US';
    }

    getDeviceType(userAgent) {
        if (!userAgent) return 'unknown';
        if (userAgent.includes('Mobile')) return 'mobile';
        if (userAgent.includes('Tablet')) return 'tablet';
        return 'desktop';
    }
}

module.exports = new SessionService();
