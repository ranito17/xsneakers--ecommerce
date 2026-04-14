// middleware לאימות משתמשים - בודק טוקן JWT
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const isAuthenticated = async (req, res, next) => {
    try {
        // In cross-origin production (Vercel + Railway) browsers block third-party
        // cookies, so we accept the token from the Authorization header first.
        // Cookie fallback keeps same-origin / development working unchanged.
        let token = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            token = req.cookies?.token;
        }

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