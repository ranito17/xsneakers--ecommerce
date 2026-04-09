const emailService = require('../services/emailService');
const Settings = require('../models/Settings');

// שליחת אימייל מילוי מלאי לספק
const sendStockRefuelEmail = async (req, res) => {
    try {
        const { products, notes } = req.body;
        
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Products array is required and must not be empty'
            });
        }

        // קבלת מידע ספק מהגדרות
        const settings = await Settings.getSettings();
        if (!settings || !settings.supplier_email) {
            return res.status(400).json({
                success: false,
                message: 'Supplier email not configured in settings'
            });
        }

        // שליחת אימייל לספק
        await emailService.sendStockRefuelEmail({
            supplierEmail: settings.supplier_email,
            supplierName: settings.supplier_name || 'Supplier',
            products,
            notes: notes || ''
        });

        res.json({
            success: true,
            message: 'Stock refuel email sent successfully to supplier',
            data: {
                supplierEmail: settings.supplier_email
            }
        });

    } catch (error) {
        console.error('Error sending stock refuel email:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send stock refuel email'
        });
    }
};

module.exports = {
    sendStockRefuelEmail
};
