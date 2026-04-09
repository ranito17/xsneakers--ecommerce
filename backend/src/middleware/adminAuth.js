
// בודק שהמשתמש הוא אדמין (האימות כבר בוצע ב-middleware הקודם)
const adminAuth = async (req, res, next) => {
    try {
        // בדיקה אם למשתמש יש תפקיד אדמין
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        // המשתמש מאומת ויש לו תפקיד אדמין
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authorization'
        });
    }
};

// middleware אופציונלי לבדיקת הרשאות ספציפיות לאדמין
// ניתן להרחיב עבור רמות אדמין שונות (super admin, moderator וכו')
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

            // בדיקת הרשאות ספציפיות אם למשתמש יש הרשאות
            if (req.user.permissions && !req.user.permissions.includes(requiredPermission)) {
                return res.status(403).json({
                    success: false,
                    message: `Permission denied: ${requiredPermission} required`
                });
            }

            next();
        } catch (error) {
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