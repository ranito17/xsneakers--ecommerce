// middleware לרישום בקשות ותגובות - פשוט אך אינפורמטיבי
const logger = (req, res, next) => {
    const start = Date.now();

    // רישום כשהתגובה מסתיימת
    res.on('finish', () => {
        const duration = Date.now() - start;
        const timestamp = new Date().toISOString();
        
        // צביעת קוד סטטוס
        let statusColor = '\x1b[32m'; // ירוק עבור 2xx
        if (res.statusCode >= 500) statusColor = '\x1b[31m'; // אדום עבור 5xx
        else if (res.statusCode >= 400) statusColor = '\x1b[33m'; // צהוב עבור 4xx
        else if (res.statusCode >= 300) statusColor = '\x1b[36m'; // כחול עבור 3xx

        // שורת רישום ראשית
        console.log(
            `${statusColor}[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms\x1b[0m`
        );

        // רישום פרטים נוספים אם קיימים
        if (Object.keys(req.params || {}).length > 0) {
            console.log('  📋 Params:', req.params);
        }
        if (Object.keys(req.query || {}).length > 0) {
            console.log('  🔍 Query:', req.query);
        }
        if (req.body && Object.keys(req.body).length > 0) {
            // הסרת נתונים רגישים
            const sanitizedBody = { ...req.body };
            if (sanitizedBody.password) sanitizedBody.password = '***';
            if (sanitizedBody.current_password) sanitizedBody.current_password = '***';
            if (sanitizedBody.new_password) sanitizedBody.new_password = '***';
            console.log('  📦 Body:', sanitizedBody);
        }
    });

    next();
};

module.exports = logger;