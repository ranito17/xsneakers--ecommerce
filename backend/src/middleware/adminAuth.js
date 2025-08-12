// backend/src/middleware/adminAuth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to check if user is authenticated and has admin role
 * This middleware should be used after the regular auth middleware
 */
const adminAuth = async (req, res, next) => {
    try {
        // Check if user has admin role (authentication already verified by previous middleware)
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        // User is authenticated and has admin role
        next();
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authorization'
        });
    }
};

/**
 * Optional: Middleware to check for specific admin permissions
 * You can extend this for different admin levels (super admin, moderator, etc.)
 */
const adminPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            }

            // Check for specific permissions if user has them
            if (req.user.permissions && !req.user.permissions.includes(requiredPermission)) {
                return res.status(403).json({
                    success: false,
                    message: `Permission denied: ${requiredPermission} required`
                });
            }

            next();
        } catch (error) {
            console.error('Admin permission middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during permission check'
            });
        }
    };
};

module.exports = {
    adminAuth,
    adminPermission
}; 