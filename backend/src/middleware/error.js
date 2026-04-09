// middleware לטיפול בשגיאות - לוכד ומטפל בכל השגיאות באפליקציה
const errorMiddleware = (err, req, res, next) => {
    // רישום פרטי שגיאה לדיבוג
    const timestamp = new Date().toISOString();
    console.error('\n' + '='.repeat(80));
    console.error(`❌ [${timestamp}] ERROR CAUGHT`);
    console.error(`📍 Route: ${req.method} ${req.originalUrl}`);
    console.error(`🔴 Error Name: ${err.name}`);
    console.error(`💬 Error Message: ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
        console.error(`📚 Stack Trace:\n${err.stack}`);
    }
    console.error('='.repeat(80) + '\n');

    // קביעת קוד סטטוס
    let statusCode = err.statusCode || err.status || 500;
    
    // טיפול בסוגי שגיאות ספציפיים
    let message = err.message || 'Internal server error';
    
    // שגיאות JWT
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    
    // שגיאות ולידציה
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
    }
    
    // שגיאות מסד נתונים
    else if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        message = 'Duplicate entry - resource already exists';
    } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = 400;
        message = 'Invalid reference - related resource not found';
    } else if (err.code && err.code.startsWith('ER_')) {
        statusCode = 500;
        message = 'Database error occurred';
    }
    
    // שגיאות Cast
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid data format';
    }

    // בניית תגובת שגיאה
    const errorResponse = {
        success: false,
        error: {
            message: message,
            type: err.name || 'Error',
            statusCode: statusCode
        }
    };

    // הוספת פרטים נוספים בסביבת פיתוח
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.error.stack = err.stack;
        errorResponse.error.details = err.details || null;
    }

    res.status(statusCode).json(errorResponse);
};

module.exports = errorMiddleware;