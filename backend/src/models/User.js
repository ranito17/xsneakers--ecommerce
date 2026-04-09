// מודל המשתמשים - מנהל את כל הפעולות הקשורות למשתמשים במסד הנתונים
// מתחבר לבסיס הנתונים דרך dbSingleton לביצוע שאילתות
const dbSingleton = require('../config/database');
const bcrypt = require('bcrypt');


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
        throw error;
    }
}

// מציאת משתמש לפי אימייל בלבד (ללא אימות סיסמה)
// פונקציה שמחפשת משתמש לפי אימייל ומחזירה את פרטיו
async function findUserByEmail(email, dbConnection = null) {
    const db = dbConnection || await dbSingleton.getConnection();

    try {
        const [userRow] = await db.query('SELECT *  FROM users WHERE email = ?', [email]);
        return userRow[0] || null;
    } catch (error) {
        throw error;
    }
}

// יצירת משתמש חדש במסד הנתונים
// פונקציה שמצפינה סיסמה ויוצרת משתמש חדש עם טרנזקציה
async function createUser(userData) {
    const db = await dbSingleton.getDedicatedConnection(); // dedicated connection for transaction safety

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
             'customer'
        ]);

        await db.commit(); // אישור הטרנזקציה

        return result.insertId; // מחזיר את מזהה המשתמש החדש
        } 
        catch (err) {
    await db.rollback(); // ביטול הטרנזקציה במקרה של שגיאה
    let errorMessage = 'User creation failed';
    if (err.code === 'ER_DUP_ENTRY') {
        errorMessage = 'User with this email already exists';
    } 
    
    throw new Error(errorMessage);

    }
    finally {
        try {
            await db.release();
        } catch (closeError) {
            // preserve existing behavior
        }
    }
}

// יצירת קוד לאיפוס סיסמה
// פונקציה שיוצרת קוד אקראי 6 ספרות ומעדכנת את המשתמש במסד הנתונים
async function createPasswordResetCode(email) {
    const db = await dbSingleton.getConnection();

    try {
        // בדיקה שהמשתמש קיים
        const user = await findUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        // יצירת קוד אקראי 6 ספרות
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // תוקף של 15 דקות

        // עדכון המשתמש עם הקוד
        const query = 'UPDATE users SET reset_code = ?, reset_code_expiry = ? WHERE email = ?';
        await db.query(query, [resetCode, resetCodeExpiry, email]);

        return resetCode;
    } catch (error) {
        throw error;
    }
}

// בדיקת קוד איפוס סיסמה
// פונקציה שבודקת שהקוד תקין ולא פג תוקף
async function verifyPasswordResetCode(email, code, dbConnection = null) {
    const db = dbConnection || await dbSingleton.getConnection();

    try {
        const query = 'SELECT * FROM users WHERE email = ? AND reset_code = ? AND reset_code_expiry > NOW()';
        const [userRow] = await db.query(query, [email, code]);
        return userRow[0] || null;
    } catch (error) {
        throw error;
    }
}

// איפוס סיסמה
// פונקציה שמעדכנת סיסמה חדשה ומנקה את הקוד
async function resetPassword(email, code, newPassword) {
    const db = await dbSingleton.getDedicatedConnection();

    try {
        await db.beginTransaction();

        // בדיקה שהקוד תקין
        const user = await verifyPasswordResetCode(email, code, db);
        if (!user) {
            throw new Error('Invalid or expired reset code');
        }

        // הצפנת הסיסמה החדשה
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // עדכון הסיסמה וניקוי הקוד
        const query = 'UPDATE users SET password = ?, reset_code = NULL, reset_code_expiry = NULL WHERE id = ?';
        await db.query(query, [hashedPassword, user.id]);

        await db.commit();
        return true;
    } catch (error) {
        await db.rollback();
        throw error;
    } finally {
        try {
            await db.release();
        } catch (closeError) {
            // preserve existing behavior
        }
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
        throw error;
    }
}

// קבלת הזמנות של משתמש
// פונקציה שמחזירה את כל ההזמנות של משתמש מסוים
async function getUserOrders(userId) {
    try {
    const db = await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT 
                order_id,
                user_id,
                total_amount,
                payment_status,
                order_number,
                status,
                arrival_date_estimated,
                created_at
            FROM orders 
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);
        return rows;
    } catch (err) {
        throw new Error('Failed to fetch user orders');
    }
        }

// קבלת מספר הזמנות של משתמש (למעט בוטלו והושלמו)
// פונקציה שמחזירה את מספר ההזמנות של משתמש שלא בוטלו ולא הושלמו
async function getUserOrderCount(userId) {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT COUNT(*) as order_count
            FROM orders 
            WHERE user_id = ?
            AND status != 'cancelled'
            AND status != 'completed'
        `, [userId]);
        return rows[0].order_count;
    } catch (err) {
        throw new Error('Failed to fetch user order count');
    }
}

// עדכון פרטי משתמש (שם וטלפון)
// פונקציה שמעדכנת את הפרטים האישיים של המשתמש
async function updateProfile(userId, profileData) {
    const db = await dbSingleton.getConnection();

    try {
        const updates = [];
        const values = [];

        if (profileData.full_name !== undefined) {
            updates.push('full_name = ?');
            values.push(profileData.full_name);
        }

        if (profileData.phone_number !== undefined) {
            updates.push('phone_number = ?');
            values.push(profileData.phone_number);
        }

        values.push(userId);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        await db.query(query, values);

        // קבלת הנתונים המעודכנים
        const [userRow] = await db.query('SELECT id, full_name, email, address, phone_number, role, created_at FROM users WHERE id = ?', [userId]);
        return userRow[0];
    } catch (error) {
        throw error;
    }
}

// עדכון כתובת משתמש
// פונקציה שמעדכנת את כתובת המשתמש בפורמט JSON
async function updateAddress(userId, addressData) {
    const db = await dbSingleton.getConnection();

    try {
        // יצירת אובייקט כתובת מלא
        const address = {
            house_number: addressData.house_number,
            street: addressData.street,
            city: addressData.city,
            zipcode: addressData.zipcode
        };

        // MySQL JSON column accepts JSON string
        const addressJson = JSON.stringify(address);

        const query = 'UPDATE users SET address = ? WHERE id = ?';
        await db.query(query, [addressJson, userId]);

        // קבלת הנתונים המעודכנים
        const [userRows] = await db.query('SELECT id, full_name, email, address, phone_number, role, created_at FROM users WHERE id = ?', [userId]);
        
        if (!userRows || userRows.length === 0) {
            throw new Error('User not found after update');
        }

        return userRows[0];
    } catch (error) {
        throw error;
    }
}

// שינוי סיסמה
// פונקציה שמאמתת את הסיסמה הנוכחית ומעדכנת לסיסמה חדשה
async function changePassword(userId, currentPassword, newPassword) {
    const db = await dbSingleton.getDedicatedConnection();

    try {
        await db.beginTransaction();

        // קבלת הסיסמה הנוכחית של המשתמש
        const [userRow] = await db.query('SELECT password, email FROM users WHERE id = ?', [userId]);
        if (userRow.length === 0) {
            throw new Error('User not found');
        }

        const user = userRow[0];

        // אימות הסיסמה הנוכחית
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            throw new Error('Current password is incorrect');
        }

        // הצפנת הסיסמה החדשה
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // עדכון הסיסמה
        const query = 'UPDATE users SET password = ? WHERE id = ?';
        await db.query(query, [hashedPassword, userId]);

        await db.commit();
        return true;
    } catch (error) {
        await db.rollback();
        throw error;
    } finally {
        try {
            await db.release();
        } catch (closeError) {
            // preserve existing behavior
        }
    }
}

// קבלת רשימת המשאלות של המשתמש
// פונקציה שמחזירה את מוצרי רשימת המשאלות של המשתמש
async function getWishlist(userId) {
    const db = await dbSingleton.getConnection();

    try {
        const [userRow] = await db.query('SELECT wishlist FROM users WHERE id = ?', [userId]);
        if (!userRow || userRow.length === 0) {
            throw new Error('User not found');
        }

        const wishlist = userRow[0].wishlist ? JSON.parse(userRow[0].wishlist) : [];
     
        return wishlist;
    } catch (error) {
        throw error;
    }
}

// הוספת מוצר לרשימת המשאלות
// פונקציה שמוסיפה מוצר לרשימת המשאלות של המשתמש
async function addToWishlist(userId, productId) {
    const db = await dbSingleton.getConnection();

    try {
        const wishlist = await getWishlist(userId);
        
        // בדיקה אם המוצר כבר ברשימה
        if (wishlist.includes(productId)) {
            return wishlist; // המוצר כבר קיים
        }

        wishlist.push(productId);
        const wishlistJson = JSON.stringify(wishlist);

        await db.query('UPDATE users SET wishlist = ? WHERE id = ?', [wishlistJson, userId]);
        return wishlist;
    } catch (error) {
        throw error;
    }
}

// הסרת מוצר מרשימת המשאלות
// פונקציה שמסירה מוצר מרשימת המשאלות של המשתמש
async function removeFromWishlist(userId, productId) {
    const db = await dbSingleton.getConnection();

    try {
        const wishlist = await getWishlist(userId);
        
        // סינון המוצר שנמחק
        const updatedWishlist = wishlist.filter(id => id !== productId);
        const wishlistJson = JSON.stringify(updatedWishlist);

        await db.query('UPDATE users SET wishlist = ? WHERE id = ?', [wishlistJson, userId]);
        return updatedWishlist;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    findUser,
    findUserByEmail,
    createUser,
    createPasswordResetCode,
    verifyPasswordResetCode,
    resetPassword,
    getAllUsers,
    getUserOrders,
    getUserOrderCount,
    updateProfile,
    updateAddress,
    changePassword,
    getWishlist,
    addToWishlist,
    removeFromWishlist
}
