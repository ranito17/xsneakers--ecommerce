// מודל המשתמשים - מנהל את כל הפעולות הקשורות למשתמשים במסד הנתונים
// מתחבר לבסיס הנתונים דרך dbSingleton לביצוע שאילתות
const dbSingleton = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// מציאת משתמש ואימות סיסמה
// פונקציה שמחפשת משתמש לפי אימייל ובודקת את הסיסמה המוצפנת
async function findUser(email, password) {
    const db = await dbSingleton.getConnection(); // חיבור promise

    try {
        // קבלת הסיסמה המוצפנת מהמסד נתונים
        const [hashedRow] = await db.query('SELECT password FROM users WHERE email = ?', [email]);
        const hashedPassword = hashedRow[0]?.password;
        if (!hashedPassword) return null;

        // השוואת הסיסמה שהוזנה עם הסיסמה המוצפנת
        const isValid = await bcrypt.compare(password, hashedPassword);
        if (!isValid) return null;

        // קבלת כל פרטי המשתמש אם הסיסמה נכונה
        const [userRow] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return userRow[0] || null;
    } catch (error) {
        console.error('Error in findUser:', error);
        throw error;
    }
}

// מציאת משתמש לפי אימייל בלבד (ללא אימות סיסמה)
// פונקציה שמחפשת משתמש לפי אימייל ומחזירה את פרטיו
async function findUserByEmail(email) {
    const db = await dbSingleton.getConnection();

    try {
        const [userRow] = await db.query('SELECT *  FROM users WHERE email = ?', [email]);
        return userRow[0] || null;
    } catch (error) {
        console.error('Error in findUserByEmail:', error);
        throw error;
    }
}

// יצירת משתמש חדש במסד הנתונים
// פונקציה שמצפינה סיסמה ויוצרת משתמש חדש עם טרנזקציה
async function createUser(userData) {
    const db = await dbSingleton.getConnection(); // חיבור promise

    try {
        await db.beginTransaction(); // התחלת טרנזקציה

        // הצפנת הסיסמה עם מלח
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // הכנסת המשתמש למסד הנתונים
        const query = 'INSERT INTO users (full_name, email, address, phone_number, password, role) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [
            userData.full_name,
            userData.email, 
            userData.address || null,
            userData.phone_number || null,
            hashedPassword,
            userData.role || 'customer'
        ]);

        await db.commit(); // אישור הטרנזקציה

        return result.insertId; // Return just the userId
        } 
        catch (err) {
    await db.rollback(); // ביטול הטרנזקציה במקרה של שגיאה
    console.error('Transaction Error:', err.message);
    let errorMessage = 'User creation failed';
    if (err.code === 'ER_DUP_ENTRY') {
        errorMessage = 'User with this email already exists';
    } 
    
    throw new Error(errorMessage);

    }
}

// יצירת טוקן לאיפוס סיסמה
// פונקציה שיוצרת טוקן אקראי ומעדכנת את המשתמש במסד הנתונים
async function createPasswordResetToken(email) {
    const db = await dbSingleton.getConnection();

    try {
        // בדיקה שהמשתמש קיים
        const user = await findUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        // יצירת טוקן אקראי
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // עדכון המשתמש עם הטוקן
        const query = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
        await db.query(query, [resetToken, resetTokenExpiry, email]);

        return resetToken;
    } catch (error) {
        console.error('Error in createPasswordResetToken:', error);
        throw error;
    }
}

// מציאת משתמש לפי טוקן איפוס סיסמה
// פונקציה שמחפשת משתמש לפי טוקן ובודקת שהטוקן לא פג תוקף
async function findUserByResetToken(resetToken) {
    const db = await dbSingleton.getConnection();

    try {
        const query = 'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()';
        const [userRow] = await db.query(query, [resetToken]);
        return userRow[0] || null;
    } catch (error) {
        console.error('Error in findUserByResetToken:', error);
        throw error;
    }
}

// איפוס סיסמה
// פונקציה שמעדכנת סיסמה חדשה ומנקה את הטוקן
async function resetPassword(resetToken, newPassword) {
    const db = await dbSingleton.getConnection();

    try {
        await db.beginTransaction();

        // בדיקה שהטוקן תקין
        const user = await findUserByResetToken(resetToken);
        if (!user) {
            throw new Error('Invalid or expired reset token');
        }

        // הצפנת הסיסמה החדשה
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // עדכון הסיסמה וניקוי הטוקן
        const query = 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?';
        await db.query(query, [hashedPassword, user.id]);

        await db.commit();
        return true;
    } catch (error) {
        await db.rollback();
        console.error('Error in resetPassword:', error);
        throw error;
    }
}

// קבלת כל המשתמשים
// פונקציה שמחזירה את כל המשתמשים במערכת (ללא סיסמאות)
async function getAllUsers() {
    const db = await dbSingleton.getConnection();

    try {
        const query = 'SELECT id, full_name, email, address, phone_number, role, created_at FROM users ORDER BY created_at DESC';
        const [users] = await db.query(query);
        return users;
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        throw error;
    }
}



module.exports = {
    findUser,
    findUserByEmail,
    createUser,
    createPasswordResetToken,
    findUserByResetToken,
    resetPassword,
    getAllUsers
}
