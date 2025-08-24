// backend/src/middleware/guestSession.js
const sessionService = require('../services/sessionService');

// Middleware to handle guest sessions
const guestSession = (req, res, next) => {
    try {
        // If user is not authenticated, create a guest session
        if (!req.session.isAuthenticated) {
            // Create guest session data
            const guestData = sessionService.createGuestSessionData(req);
            
            // Store guest session data
            req.session.guestData = guestData;
            req.session.isGuest = true;
            req.session.lastActivity = new Date().toISOString();
            
            console.log('👤 Guest session created for IP:', req.ip);
        }
        
        next();
    } catch (error) {
        console.error('Error in guest session middleware:', error);
        next(); // Continue even if guest session creation fails
    }
};

module.exports = guestSession;
