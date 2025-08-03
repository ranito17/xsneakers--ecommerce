// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const isAuthenticated = async (req, res, next) => {
    try {
        console.log('🔐 Auth middleware called for:', req.path);
        console.log('🍪 All cookies:', req.cookies);
        console.log('📋 Authorization header:', req.headers.authorization);
        console.log('🌐 Request origin:', req.headers.origin);
        console.log('🔗 Request method:', req.method);
        console.log('📄 Request URL:', req.url);
        
        // Check for token in cookies or Authorization header
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            console.log('❌ No token found in cookies or headers');
            console.log('❌ Cookies object:', req.cookies);
            console.log('❌ Authorization header:', req.headers.authorization);
            // Return 401 response when no token
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        console.log('🔑 Token found:', token.substring(0, 20) + '...');
        console.log('🔑 Token length:', token.length);

        // Verify token using the secret from config
        const verified = jwt.verify(token, config.jwtSecret);
        console.log('🔍 JWT verification result:', verified);
        
        // If token is valid, set user info from token
        req.user = verified;
        
        console.log('✅ Token verified for user:', verified.email);
        console.log('✅ req.user set to:', req.user);
        next();
    } catch (err) {
        console.log('❌ Authentication error:', err.message);
        console.log('❌ Error stack:', err.stack);
        console.log('❌ JWT secret available:', !!config.jwtSecret);
        // Return 401 response when token is invalid
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = isAuthenticated;