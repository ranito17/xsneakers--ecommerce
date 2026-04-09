const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { generalLimiter } = require('./middleware/rateLimiter');
const config = require('./config/config');
const errorMiddleware = require('./middleware/error');
const logger = require('./middleware/logger');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const messageRoutes = require('./routes/messageRoutes');
const activityRoutes = require('./routes/activityRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

const corsOptions = {
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
};

// CORS FIRST (must list every non-simple header the browser sends on preflight)
app.use(cors(corsOptions));

// Explicitly handle preflight
app.options('*', cors(corsOptions));

// Then security + rate limiting
app.use(helmet({
    // Frontend runs on :3000 and loads images from :3001 (/uploads/...).
    // Helmet defaults can block those as "NotSameOrigin".
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Only rate limit API routes (do NOT rate limit static /uploads assets)
app.use('/api', generalLimiter);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logger
app.use(logger);

// Ensure upload directories exist
const categoryUploadsDir = path.join(__dirname, 'uploads', 'category');
const productUploadsDir = path.join(__dirname, 'uploads', 'products');

if (!fs.existsSync(categoryUploadsDir)) {
    fs.mkdirSync(categoryUploadsDir, { recursive: true });
}

if (!fs.existsSync(productUploadsDir)) {
    fs.mkdirSync(productUploadsDir, { recursive: true });
}

// Static files
app.use(
    '/uploads',
    (req, res, next) => {
        // Make images renderable cross-origin (frontend on :3000, backend on :3001)
        // This avoids ERR_BLOCKED_BY_RESPONSE.NotSameOrigin in modern browsers.
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', config.corsOrigin);
        res.setHeader('Vary', 'Origin');
        next();
    },
    express.static(path.join(__dirname, 'uploads'))
);

// API routes
app.use('/api/userRoutes', userRoutes);
app.use('/api/productRoutes', productRoutes);
app.use('/api/categoryRoutes', categoryRoutes);
app.use('/api/cartRoutes', cartRoutes);
app.use('/api/orderRoutes', orderRoutes);
app.use('/api/settingsRoutes', settingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/activityRoutes', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error middleware last
app.use(errorMiddleware);

module.exports = app;