require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const baseConfig = {
    // Server
    port: Number(process.env.PORT) || 3001,
    nodeEnv: env,

    // JWT
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // Database
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || ''
    },

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

    // File Upload
    uploadPath: process.env.UPLOAD_PATH || 'uploads',
    maxFileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,

    // Session
    sessionSecret: process.env.SESSION_SECRET || '',

    // Rate Limiting
    rateLimit: {
        windowMs: (Number(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
        max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },

    // Email Configuration
    email: {
        fromEmail: process.env.FROM_EMAIL || '',
        fromName: process.env.FROM_NAME || '',
        adminEmail: process.env.ADMIN_EMAIL || '',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
    }
};

const config = {
    development: {
        ...baseConfig,
        paypal: {
            clientId: process.env.PAYPAL_CLIENT_ID || '',
            clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
            mode: process.env.PAYPAL_MODE || 'sandbox'
        }
    },

    production: {
        ...baseConfig,
        paypal: {
            clientId: process.env.PAYPAL_CLIENT_ID || '',
            clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
            mode: process.env.PAYPAL_MODE || 'sandbox'
        }
    }
};

module.exports = config[env] || config.development;