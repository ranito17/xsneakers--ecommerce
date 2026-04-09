const Settings = require('../models/Settings');
const { validateUpdateSettingsPayload } = require('../validation/settingsValidator');

const getSettings = async (req, res) => {
    try {
        // בדיקה אם תיאורים נדרשים
        const includeDescriptions = req.query.descriptions === 'true';
        
        const settings = includeDescriptions 
            ? await Settings.getSettingsWithDescriptions()
            : await Settings.getSettings();
            
        res.status(200).json({
            success: true,
            message: 'Settings retrieved successfully',
            data: settings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

const getPublicSettings = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        // החזרת הגדרות ציבוריות כולל מידע משלוח ומטבע
        const publicSettings = {
            store_name: settings?.store_name || '',
            supplier_email: settings?.supplier_email || '',
            store_instagram: settings?.store_instagram || '',
            currency: settings?.currency || 'ILS',
            default_delivery_cost: settings?.default_delivery_cost || settings?.default_shipping_cost || 0.00,
            free_delivery_threshold: settings?.free_delivery_threshold || settings?.free_shipping_threshold || 0.00,
            homepage_display_limit: settings?.homepage_display_limit || 8
        };
        res.status(200).json({
            success: true,
            message: 'Public settings retrieved successfully',
            data: publicSettings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

const updateSettings = async (req, res) => {
    try {
        const validation = validateUpdateSettingsPayload(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const result = await Settings.updateSettings(validation.sanitizedData);
        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

module.exports = {
    getSettings,
    getPublicSettings,
    updateSettings
}; 