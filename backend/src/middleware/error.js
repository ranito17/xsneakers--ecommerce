// תוכנה לטיפול בשגיאות - תופסת שגיאות שלא טופלו ומחזירה תגובה מתאימה
// מתחברת לכל הבקשות ומטפלת בשגיאות שלא נתפסו במקומות אחרים
const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
};

module.exports = errorMiddleware;