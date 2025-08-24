// קובץ האפליקציה הראשי - מגדיר את השרת ואת כל הנתיבים
// מתחבר לכל הרכיבים ומגדיר את זרימת העבודה של האפליקציה



//ראני טובאסי 49.1 ת.ז:326157906

const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const config = require('./config/config');
const errorMiddleware = require('./middleware/error');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const logger = require('./middleware/logger');
const cookieParser = require('cookie-parser');
const uploadRoutes = require('./routes/uploadRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const supplierRoutes = require('./routes/supplierRoutes');

// תוכנות ביניים - מתחברות לכל הבקשות
// הגדרת CORS - מאפשר גישה מהדפדפן
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,

}));

// פענוח JSON ונתוני טופס
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (for guest carts only)
app.use(session({
    secret: config.jwtSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict'
    },
    name: 'guestSession' // Different name to avoid conflicts
}));

// Guest cart session middleware (for non-authenticated users)
app.use((req, res, next) => {
    // Initialize guest cart session if not exists
    if (!req.session.guestCart) {
        req.session.guestCart = {
            items: [],
            total_cost: 0.00,
            item_count: 0
        };
    }
    next();
});

// תוכנות לטיפול בשגיאות ורישום פעילות
app.use(errorMiddleware);
app.use(logger);
app.use(cookieParser());



// הגדרת נתיבי API
// נתיבי משתמשים - התחברות ויצירת משתמשים
app.use('/api/userRoutes', userRoutes);
// נתיבי מוצרים - ניהול מוצרים
app.use('/api/productRoutes', productRoutes);
// נתיבי קטגוריות - ניהול קטגוריות
app.use('/api/categoryRoutes', categoryRoutes);
// נתיבי עגלת קניות - ניהול עגלת קניות
app.use('/api/cartRoutes', cartRoutes);
// נתיבי הזמנות - ניהול הזמנות
app.use('/api/orderRoutes', orderRoutes);
// נתיבי הגדרות - ניהול הגדרות המערכת
app.use('/api/settingsRoutes', settingsRoutes);
// נתיבי קשר - שליחת הודעות קשר
app.use('/api/contact', contactRoutes);
// נתיבי ספק - ניהול בקשות מלאי ומילוי הזמנות
app.use('/api/supplier', supplierRoutes);
// נתיבי העלאה - ניהול העלאת קבצים
app.use('/api/upload', uploadRoutes);

// Serve uploadenpmnd files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// טיפול בנתיבים שלא קיימים
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// הפעלת השרת על הפורט המוגדר
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
});