// מודל פעילות - מנהל את כל הפעולות הקשורות למעקב פעילות במסד הנתונים
const dbSingleton = require('../config/database');

    // יצירת רשומת פעילות חדשה
// משמש ב: Order.js (3 פעמים - הפחתת/הגדלת מלאי), activityLogger.js (רישום פעילויות כלליות)
async function create(activityData, dbConnection = null) {
        try {
            const connection = dbConnection || await dbSingleton.getConnection();
            const {
                user_id,
                action_type,
                entity_type,
                entity_id,
                description
            } = activityData;

            const [result] = await connection.execute(
                `INSERT INTO activities 
                (user_id, action_type, entity_type, entity_id, description) 
                VALUES (?, ?, ?, ?, ?)`,
                [
                    user_id || null,
                    action_type,
                    entity_type,
                    entity_id || null,
                    description
                ]
            );

            return result.insertId;
        } catch (error) {
            console.error('Error creating activity log:', error);
            throw error;
        }
    }

// קבלת פעילויות עם סינון (ללא pagination בצד השרת)
// משמש ב: activityController.js - GET /api/activityRoutes (דף פעילות אדמין)
async function getAll(filters = {}, dbConnection = null) {
        try {
            const connection = dbConnection || await dbSingleton.getConnection();
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
            } = filters;

            let query = `
                SELECT 
                    a.id,
                    a.user_id,
                    u.full_name as username,
                    u.email,
                    u.role,
                    a.action_type,
                    a.entity_type,
                    a.entity_id,
                    a.description,
                    a.created_at
                FROM activities a
                LEFT JOIN users u ON a.user_id = u.id
                WHERE 1=1
            `;

            const params = [];

            if (start_date && end_date) {
                query += ` AND a.created_at BETWEEN ? AND ?`;
                params.push(start_date, end_date);
            } else if (days_back) {
                query += ` AND a.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`;
                params.push(days_back);
            }

            if (action_type) {
                query += ` AND a.action_type = ?`;
                params.push(action_type);
            }

            if (entity_type) {
                query += ` AND a.entity_type = ?`;
                params.push(entity_type);
            }

            if (user_id) {
                query += ` AND a.user_id = ?`;
                params.push(user_id);
            }

            if (user_email) {
                query += ` AND u.email = ?`;
                params.push(user_email);
            }

            query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));

            const [activities] = await connection.query(query, params);

            return activities;
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw error;
        }
    }

    // קבלת סטטיסטיקות פעילות
// משמש ב: activityController.js - GET /api/activityRoutes/statistics (דף פעילות אדמין)
async function getStatistics(days_back = 30, dbConnection = null) {
        try {
            const connection = dbConnection || await dbSingleton.getConnection();

            const [stats] = await connection.execute(
                `
                SELECT 
                    action_type,
                    entity_type,
                    COUNT(*) as count
                FROM activities
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY action_type, entity_type
                ORDER BY count DESC
                `,
                [days_back]
            );

            return stats;
        } catch (error) {
            console.error('Error fetching activity statistics:', error);
            throw error;
        }
    }

    // מחיקת פעילויות ישנות יותר מימים מסוימים
// משמש ב: activityController.js - DELETE /api/activityRoutes/old (דף פעילות אדמין)
async function deleteOldActivities(daysOld = 90, dbConnection = null) {
        try {
            const connection = dbConnection || await dbSingleton.getConnection();

            const [result] = await connection.execute(
                `DELETE FROM activities 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
                [daysOld]
            );

            return result.affectedRows;
        } catch (error) {
            console.error('Error deleting old activities:', error);
            throw error;
        }
    }

module.exports = {
    create,
    getAll,
    getStatistics,
    deleteOldActivities
};

