const dbSingleton = require('../config/database');

// מודל הגדרות מבוסס Key-Value
// מבנה גמיש ויעיל לניהול הגדרות האפליקציה

// הגדרות ברירת מחדל עם תיאורים
const DEFAULT_SETTINGS = {
    store_name: { value: 'My Store', description: 'Store name displayed to customers' },
    supplier_name: { value: 'Supplier Name', description: 'Supplier company name' },
    supplier_email: { value: '', description: 'Supplier contact email address' },
    tax_rate: { value: '0.00', description: 'Tax rate as decimal (e.g., 0.09 for 9%)' },
    currency: { value: 'ILS', description: 'Currency code (USD, ILS, EUR, etc.)' },
    default_delivery_cost: { value: '0.00', description: 'Default shipping cost' },
    free_delivery_threshold: { value: '0.00', description: 'Minimum order amount for free delivery' },
    email_notification: { value: '', description: 'Admin email for notifications' },
    store_instagram: { value: '', description: 'Instagram handle without @' },
    low_stock_threshold: { value: '10', description: 'Overall low stock alert threshold' },
    low_stock_threshold_per_size: { value: '5', description: 'Per-size low stock threshold' },
    homepage_display_limit: { value: '8', description: 'Number of products to show on homepage sections' }
};

// המרת ערך מחרוזת לטיפוס מתאים לפי התוכן
function convertValueType(value) {
    // ניסיון לפרסר כמספר
    const num = parseFloat(value);
    if (!isNaN(num) && value.trim() !== '') {
        return num;
    }
    
    // בדיקה לבוליאני
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // ניסיון לפרסר כ-JSON
    if ((value.startsWith('{') && value.endsWith('}')) || 
        (value.startsWith('[') && value.endsWith(']'))) {
        try {
            return JSON.parse(value);
        } catch (e) {
            // לא JSON תקין, מחזיר כמחרוזת
        }
    }
    
    // החזרה כמחרוזת
    return value;
}

// פונקציית אדמין/שרת: קבלת כל ההגדרות כאובייקט לשימוש שירותים (מייל, דאשבורד, וכו')
async function getSettings() {
    try {
        const db = await dbSingleton.getConnection();
        
        // קבלת כל ההגדרות מטבלת key-value
        const [rows] = await db.query('SELECT setting_key, setting_value FROM settings');
        
        // המרת מערך לאובייקט עם המרת טיפוס
        const settings = {};
        rows.forEach(row => {
            const { setting_key, setting_value } = row;
            settings[setting_key] = convertValueType(setting_value);
        });
        
        // מיזוג עם ברירות מחדל להגדרות חסרות
        const result = {};
        for (const [key, defaultObj] of Object.entries(DEFAULT_SETTINGS)) {
            if (settings.hasOwnProperty(key)) {
                result[key] = settings[key];
            } else {
                // שימוש בערך ברירת מחדל והמרה לטיפוס נכון
                result[key] = convertValueType(defaultObj.value);
            }
        }
        
        return result;
    } catch (err) {
        console.error('Database error in getSettings:', err);
        throw new Error('Failed to fetch settings');
    }
}

// עדכון הגדרה אחת או יותר
async function updateSettings(settingsData) {
    try {
        const db = await dbSingleton.getConnection();
        
        // הכנת עדכון/הכנסה מרוכז
        const values = [];
        const placeholders = [];
        
        for (const [key, value] of Object.entries(settingsData)) {
            // המרת ערך למחרוזת לאחסון
            let stringValue;
            if (typeof value === 'object') {
                stringValue = JSON.stringify(value);
            } else {
                stringValue = String(value);
            }
            
            values.push(key, stringValue);
            placeholders.push('(?, ?)');
        }
        
        if (values.length === 0) {
            return { affectedRows: 0 };
        }
        
        // שימוש ב-INSERT ... ON DUPLICATE KEY UPDATE ל-upsert
        const query = `
            INSERT INTO settings (setting_key, setting_value)
            VALUES ${placeholders.join(', ')}
            ON DUPLICATE KEY UPDATE 
                setting_value = VALUES(setting_value),
                updated_at = CURRENT_TIMESTAMP
        `;
        
        const [result] = await db.query(query, values);
        return result;
    } catch (err) {
        console.error('Database error in updateSettings:', err);
        throw new Error('Failed to update settings');
    }
}

// קבלת הגדרה אחת לפי מפתח
async function getSetting(key, defaultValue = null) {
    try {
        const db = await dbSingleton.getConnection();
        
        const [rows] = await db.query(
            'SELECT setting_value FROM settings WHERE setting_key = ?',
            [key]
        );
        
        if (rows.length > 0) {
            return convertValueType(rows[0].setting_value);
        }
        
        // החזרת ברירת מחדל אם לא נמצא
        if (defaultValue !== null) {
            return defaultValue;
        }
        
        // בדיקה אם יש ברירת מחדל ב-DEFAULT_SETTINGS
        if (DEFAULT_SETTINGS[key]) {
            return convertValueType(DEFAULT_SETTINGS[key].value);
        }
        
        return null;
    } catch (err) {
        console.error('Database error in getSetting:', err);
        return defaultValue;
    }
}

// מחיקת הגדרה לפי מפתח
// פונקציה זו הוסרה - לא בשימוש
// async function deleteSetting(key) { ... }

// קבלת כל ההגדרות עם התיאורים שלהן
// שימושי לממשקי אדמין
// משמש ב: settingsController.js - כאשר שולחים query parameter descriptions=true ב-GET /api/settingsRoutes
async function getSettingsWithDescriptions() {
    try {
        const db = await dbSingleton.getConnection();
        
        const [rows] = await db.query('SELECT setting_key, setting_value, description FROM settings');
        
        const settings = {};
        rows.forEach(row => {
            const { setting_key, setting_value, description } = row;
            settings[setting_key] = {
                value: convertValueType(setting_value),
                description: description || DEFAULT_SETTINGS[setting_key]?.description || ''
            };
        });
        
        // הוספת ברירות מחדל חסרות
        for (const [key, defaultObj] of Object.entries(DEFAULT_SETTINGS)) {
            if (!settings[key]) {
                settings[key] = {
                    value: convertValueType(defaultObj.value),
                    description: defaultObj.description
                };
            }
        }
        
        return settings;
    } catch (err) {
        console.error('Database error in getSettingsWithDescriptions:', err);
        throw new Error('Failed to fetch settings with descriptions');
    }
}

module.exports = {
    getSettings,
    updateSettings,
    getSetting,
    getSettingsWithDescriptions
};
