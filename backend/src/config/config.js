// backend/src/config/config.js
    require('dotenv').config();

const config = {
    development: {
        // Server
        // מספר הפורט עליו ירוץ השרת
        port: process.env.PORT,
        // סביבת הפעלה של Node.js
        nodeEnv: process.env.NODE_ENV,
        
        // JWT
        // מפתח סודי לחתימת טוקנים
        jwtSecret: process.env.JWT_SECRET,
        // זמן תפוגה של הטוקן
        jwtExpiresIn: process.env.JWT_EXPIRES_IN,
        
        // Database
        database: {
            // כתובת השרת של בסיס הנתונים
            host: process.env.DB_HOST,
            // שם המשתמש לבסיס הנתונים
            user: process.env.DB_USER,
            // סיסמה לבסיס הנתונים
            password: process.env.DB_PASSWORD,
            // שם בסיס הנתונים
            database: process.env.DB_NAME
        },
        
        // CORS
        // כתובת המקור המורשית לגישה לשרת
        corsOrigin: process.env.CORS_ORIGIN,
        
        // File Upload
        // נתיב לשמירת קבצים שהועלו
        uploadPath: process.env.UPLOAD_PATH,
        // גודל מקסימלי לקובץ (5MB)
        maxFileSize: process.env.MAX_FILE_SIZE,
        
        // Session
        // מפתח סודי לניהול סשנים
        sessionSecret: process.env.SESSION_SECRET,
        
        // Rate Limiting
        rateLimit: {
            // חלון זמן להגבלת בקשות (15 דקות)
            windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
            // מספר מקסימלי של בקשות בחלון הזמן
            max: process.env.RATE_LIMIT_MAX_REQUESTS
        },

        // SendGrid Email Configuration
        sendgrid: {
            apiKey: process.env.SENDGRID_API_KEY,
            fromEmail: process.env.FROM_EMAIL,
            fromName: process.env.FROM_NAME,
            adminEmail: process.env.ADMIN_EMAIL,
            frontendUrl: process.env.FRONTEND_URL
        }
    },
    
    production: {
        // Server
        // מספר הפורט עליו ירוץ השרת
        port: process.env.PORT,
        // סביבת הפעלה של Node.js
        nodeEnv: process.env.NODE_ENV,
        
        // JWT
        // מפתח סודי לחתימת טוקנים
        jwtSecret: process.env.JWT_SECRET,
        // זמן תפוגה של הטוקן
        jwtExpiresIn: process.env.JWT_EXPIRES_IN,
        
        // Database
        database: {
            // כתובת השרת של בסיס הנתונים
            host: process.env.DB_HOST,
            // שם המשתמש לבסיס הנתונים
            user: process.env.DB_USER,
            // סיסמה לבסיס הנתונים
            password: process.env.DB_PASSWORD,
            // שם בסיס הנתונים
            database: process.env.DB_NAME
        },
        
        // CORS
        // כתובת המקור המורשית לגישה לשרת
        corsOrigin: process.env.CORS_ORIGIN,
        
        // File Upload
        // נתיב לשמירת קבצים שהועלו
        uploadPath: process.env.UPLOAD_PATH,
        // גודל מקסימלי לקובץ
        maxFileSize: process.env.MAX_FILE_SIZE,
        
        // Session
        // מפתח סודי לניהול סשנים
        sessionSecret: process.env.SESSION_SECRET,
        
        // Rate Limiting
        rateLimit: {
            // חלון זמן להגבלת בקשות
            windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
            // מספר מקסימלי של בקשות בחלון הזמן
            max: process.env.RATE_LIMIT_MAX_REQUESTS
        },

        // SendGrid Email Configuration
        sendgrid: {
            apiKey: process.env.SENDGRID_API_KEY,
            fromEmail: process.env.FROM_EMAIL,
            fromName: process.env.FROM_NAME,
            adminEmail: process.env.ADMIN_EMAIL,
            frontendUrl: process.env.FRONTEND_URL
        }
    }
};

// בחירת הסביבה לפי משתנה הסביבה או ברירת מחדל לפיתוח
const env = process.env.NODE_ENV;
module.exports = config[env];