// בקר פעילות - מטפל בבקשות הקשורות לפעילות
const Activity = require('../models/Activity');

// קבלת כל הפעילויות עם מסננים
const getActivities = async (req, res) => {
    try {
        const {
            limit = 50,
            offset = 0,
            action_type,
            entity_type,
            user_id,
            user_email,
            days_back = 30,
            start_date,
            end_date
        } = req.query;

        const filters = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            action_type,
            entity_type,
            user_id: user_id ? parseInt(user_id) : undefined,
            user_email: user_email || undefined,
            days_back: days_back ? parseInt(days_back) : 30,
            start_date,
            end_date
        };

        const activities = await Activity.getAll(filters);

        res.json({
            success: true,
            data: { activities }
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activities',
            error: error.message
        });
    }
};

// קבלת סטטיסטיקות פעילות
const getStatistics = async (req, res) => {
    try {
        const { days_back = 30 } = req.query;
        
        const stats = await Activity.getStatistics(parseInt(days_back));

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching activity statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity statistics',
            error: error.message
        });
    }
};

// מחיקת פעילויות ישנות יותר מ-90 ימים
const deleteOldActivities = async (req, res) => {
    try {
        const { days_old = 90 } = req.query;
        const deletedCount = await Activity.deleteOldActivities(parseInt(days_old));

        res.json({
            success: true,
            message: `Successfully deleted ${deletedCount} activities older than ${days_old} days`,
            data: {
                deleted_count: deletedCount
            }
        });
    } catch (error) {
        console.error('Error deleting old activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete old activities',
            error: error.message
        });
    }
};

module.exports = {
    getActivities,
    getStatistics,
    deleteOldActivities
};

