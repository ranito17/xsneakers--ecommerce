const Settings = require('../models/Settings');

const getSettings = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
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

const updateSettings = async (req, res) => {
    try {
        const settingsData = req.body;
        const result = await Settings.updateSettings(settingsData);
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
    updateSettings
}; 