const dbSingleton = require('../config/database');

async function getSettings() {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query('SELECT * FROM settings ORDER BY id DESC LIMIT 1');
        return rows[0] || null;
    } catch (err) {
        console.error('Database error in getSettings:', err);
        throw new Error('Failed to fetch settings');
    }
}

async function updateSettings(settingsData) {
    try {
        const db = await dbSingleton.getConnection();
        const {
            store_name,
            supplier_name,
            supplier_email,
            supplier_phone,
            tax_rate,
            currency,
            default_shipping_cost,
            free_shipping_threshold,
            email_notification,
            store_instagram,
            store_whatsapp
        } = settingsData;

        // Check if settings exist
        const [existingSettings] = await db.query('SELECT id FROM settings LIMIT 1');
        
        if (existingSettings.length > 0) {
            // Update existing settings
            const [result] = await db.query(`
                UPDATE settings SET 
                    store_name = ?,
                    supplier_name = ?,
                    supplier_email = ?,
                    supplier_phone = ?,
                    tax_rate = ?,
                    currency = ?,
                    default_shipping_cost = ?,
                    free_shipping_threshold = ?,
                    email_notification = ?,
                    store_instagram = ?,
                    store_whatsapp = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                store_name,
                supplier_name,
                supplier_email,
                supplier_phone,
                tax_rate,
                currency,
                default_shipping_cost,
                free_shipping_threshold,
                email_notification,
                store_instagram,
                store_whatsapp,
                existingSettings[0].id
            ]);
            return result;
        } else {
            // Insert new settings
            const [result] = await db.query(`
                INSERT INTO settings (
                    store_name,
                    supplier_name,
                    supplier_email,
                    supplier_phone,
                    tax_rate,
                    currency,
                    default_shipping_cost,
                    free_shipping_threshold,
                    email_notification,
                    store_instagram,
                    store_whatsapp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                store_name,
                supplier_name,
                supplier_email,
                supplier_phone,
                tax_rate,
                currency,
                default_shipping_cost,
                free_shipping_threshold,
                email_notification,
                store_instagram,
                store_whatsapp
            ]);
            return result;
        }
    } catch (err) {
        console.error('Database error in updateSettings:', err);
        throw new Error('Failed to update settings');
    }
}

module.exports = {
    getSettings,
    updateSettings
}; 