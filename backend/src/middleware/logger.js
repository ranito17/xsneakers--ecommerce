// תוכנה לרישום פעילות - מתעדת את כל הבקשות והתגובות
// מתחברת לכל הבקשות ורושמת פרטים על הפעילות
const logger = (req, res, next) => {
    const start = Date.now();

    // האזנה לאירוע הסיום לרישום פרטי התגובה
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} ${res.statusMessage}; ${duration}ms - IP: ${req.ip}`;
        console.log(logMessage);
    });

    next();
};

module.exports = logger;