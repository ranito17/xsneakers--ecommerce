// middleware לאימות משתמשים - בודק טוקן JWT
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const isAuthenticated = async (req, res, next) => {
    try {
        // קבלת טוקן מ-HTTP-only cookie
        const token = req.cookies?.token;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        // אימות טוקן JWT
        const decoded = jwt.verify(token, config.jwtSecret);
        
        // הגדרת פרטי משתמש מה-JWT payload
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name
        };
        
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = isAuthenticated;