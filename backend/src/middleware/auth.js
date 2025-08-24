// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const isAuthenticated = async (req, res, next) => {
    try {
        console.log('🔐 Auth middleware called for:', req.path);
        
        // Get token from HTTP-only cookie
        const token = req.cookies?.token;
        
        if (!token) {
            console.log('❌ No JWT token found in cookies');
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, config.jwtSecret);
        console.log('✅ JWT verified for user:', decoded.email);
        
        // Set user info from JWT payload
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name
        };
        
        console.log('✅ req.user set to:', req.user);
        next();
    } catch (err) {
        console.log('❌ JWT verification failed:', err.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = isAuthenticated;