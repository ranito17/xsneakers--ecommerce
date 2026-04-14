// מודל אנליטיקס - מנהל את כל הפעולות הקשורות לאנליטיקס
// מתחבר לבסיס הנתונים דרך dbSingleton לביצוע שאילתות
const dbSingleton = require('../config/database');

// קבלת נתוני אנליטיקס הכנסות מקובצים לפי תקופת זמן
// startDate - תאריך התחלה בפורמט YYYY-MM-DD
// endDate - תאריך סיום בפורמט YYYY-MM-DD
// groupBy - אפשרות קיבוץ ('day', 'week', 'month', 'year')
// מחזירה: Promise<Array> נתוני אנליטיקס הכנסות
async function getRevenueAnalytics(startDate, endDate, groupBy = 'day') {
    try {
        const db = await dbSingleton.getConnection();

        // Use the same DATE_FORMAT expression in both SELECT and GROUP BY so MySQL 8.0
        // ONLY_FULL_GROUP_BY mode accepts the query. Previously, SELECT used DATE_FORMAT(...)
        // while GROUP BY used DATE(), YEARWEEK(), etc. — different expressions that MySQL 8.0
        // rejects because it can't confirm functional equivalence.
        let dateFormat;

        switch (groupBy) {
            case 'day':
            case '4weeks':
                dateFormat = '%Y-%m-%d';
                break;
            case 'week':
                dateFormat = '%Y-%u';
                break;
            case 'month':
                dateFormat = '%Y-%m';
                break;
            case 'year':
                dateFormat = '%Y';
                break;
            default:
                dateFormat = '%Y-%m-%d';
        }

        // Pass dateFormat twice: once for SELECT DATE_FORMAT, once for GROUP BY DATE_FORMAT.
        // Using the same expression in both clauses satisfies ONLY_FULL_GROUP_BY.
        const [revenueData] = await db.query(`
            SELECT
                DATE_FORMAT(created_at, ?) as period,
                SUM(total_amount) as revenue,
                COUNT(*) as order_count,
                AVG(total_amount) as avg_order_value
            FROM orders
            WHERE created_at BETWEEN ? AND ?
            AND status != 'cancelled'
            GROUP BY DATE_FORMAT(created_at, ?)
            ORDER BY period ASC
        `, [dateFormat, startDate, endDate, dateFormat]);

        return revenueData;
    } catch (err) {
        console.error('Error in getRevenueAnalytics:', err);
        throw err;
    }
}

// קבלת נתוני אנליטיקס ביצועי מוצרים
// מחשבת מטריקות ביצועי מוצרים מקיפות:
// - סה"כ הזמנות למוצר
// - כמות נמכרה והכנסות שנוצרו
// - כמות ממוצעת להזמנה
// - רמות מלאי נותר
// - ניתוח ביצועי קטגוריות
// 
// חישובים מורכבים:
// 1. חישוב הכנסות: SUM(oi.quantity * p.price) - מכפיל כמות נמכרה במחיר המוצר לכל פריט הזמנה, מאגרג על כל ההזמנות בטווח התאריכים
// 2. כמות ממוצעת להזמנה: AVG(oi.quantity) - מחשב ממוצע כמות נמכרה להזמנה, עוזר לזהות מוצרים עם נפחי הזמנות גבוהים/נמוכים
// 3. מלאי נותר: (p.stock_quantity - COALESCE(SUM(oi.quantity), 0)) - מפחית סה"כ כמות נמכרה ממלאי התחלתי, משתמש ב-COALESCE לטיפול בערכי NULL
// 4. אגרגציית ביצועי קטגוריות: מקובץ מוצרים לפי קטגוריה, מחשב מטריקות ברמת קטגוריה, משתמש ב-DISTINCT לספירת הזמנות כדי למנוע ספירה כפולה
async function getProductAnalytics(startDate, endDate) {
    try {
        const db = await dbSingleton.getConnection();
        
        // אנליטיקס ביצועי מוצרים עם חישובים מורכבים
        const [productPerformance] = await db.query(`
            SELECT 
                p.id,
                p.name,
                p.price,
                p.stock_quantity,
                COUNT(oi.order_id) as total_orders,
                SUM(oi.quantity) as total_quantity_sold,
                SUM(oi.quantity * p.price) as total_revenue,
                AVG(oi.quantity) as avg_quantity_per_order,
                (p.stock_quantity - COALESCE(SUM(oi.quantity), 0)) as remaining_stock
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.order_id
            AND o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            GROUP BY p.id
            ORDER BY total_revenue DESC
        `, [startDate, endDate]);

        // אנליטיקס ביצועי קטגוריות עם אגרגציה
        const [categoryPerformance] = await db.query(`
            SELECT 
                c.category_name,
                COUNT(DISTINCT o.order_id) as total_orders,
                SUM(oi.quantity) as total_quantity_sold,
                SUM(oi.quantity * p.price) as total_revenue
            FROM categories c
            LEFT JOIN products p ON c.category_id = p.category_id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.order_id
            AND o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            GROUP BY c.category_id
            ORDER BY total_revenue DESC
        `, [startDate, endDate]);

        return {
            productPerformance,
            categoryPerformance
        };
    } catch (err) {
        console.error('Error in getProductAnalytics:', err);
        throw err;
    }
}

// קבלת מטריקות מוצרים (מוצר הכי נמכר, גדל הכי נמכר, וכו')
async function getProductMetrics(startDate, endDate) {
    try {
        const db = await dbSingleton.getConnection();
        
        // מוצר הכי נמכר
        const [mostSoldProduct] = await db.query(`
            SELECT 
                p.id,
                p.name,
                SUM(oi.quantity) as total_quantity_sold,
                COUNT(DISTINCT oi.order_id) as total_orders,
                SUM(oi.quantity * p.price) as total_revenue
            FROM products p
            INNER JOIN order_items oi ON p.id = oi.product_id
            INNER JOIN orders o ON oi.order_id = o.order_id
            WHERE o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            GROUP BY p.id, p.name
            ORDER BY total_quantity_sold DESC
            LIMIT 1
        `, [startDate, endDate]);

        // גדל הכי נמכר
        const [mostSoldSize] = await db.query(`
            SELECT 
                oi.selected_size as size,
                SUM(oi.quantity) as total_quantity_sold,
                COUNT(DISTINCT oi.order_id) as total_orders
            FROM order_items oi
            INNER JOIN orders o ON oi.order_id = o.order_id
            WHERE o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            AND oi.selected_size IS NOT NULL
            GROUP BY oi.selected_size
            ORDER BY total_quantity_sold DESC
            LIMIT 1
        `, [startDate, endDate]);

        // קטגוריה עם הביצועים הטובים ביותר
        const [bestCategory] = await db.query(`
            SELECT 
                c.category_name,
                SUM(oi.quantity) as total_quantity_sold,
                SUM(oi.quantity * p.price) as total_revenue,
                COUNT(DISTINCT o.order_id) as total_orders
            FROM categories c
            INNER JOIN products p ON c.category_id = p.category_id
            INNER JOIN order_items oi ON p.id = oi.product_id
            INNER JOIN orders o ON oi.order_id = o.order_id
            WHERE o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            GROUP BY c.category_id, c.category_name
            ORDER BY total_revenue DESC
            LIMIT 1
        `, [startDate, endDate]);

        return {
            mostSoldProduct: mostSoldProduct[0] || null,
            mostSoldSize: mostSoldSize[0] || null,
            bestCategory: bestCategory[0] || null
        };
    } catch (err) {
        console.error('Error in getProductMetrics:', err);
        throw err;
    }
}

// קבלת אנליטיקס התפלגות סטטוס הזמנות
// מנתח דפוסי סטטוס הזמנות והשפעתם הפיננסית:
// - ספירת הזמנות לפי סטטוס (pending, processing, shipped, delivered, cancelled)
// - סה"כ הכנסות הקשורות לכל סטטוס
// - עוזר לזהות צווארי בקבוק בעיבוד הזמנות
// 
// חישובים מורכבים:
// 1. התפלגות סטטוס: COUNT(*) GROUP BY status - סופר הזמנות לכל סוג סטטוס, מספק תובנות על יעילות עיבוד הזמנות
// 2. הכנסות לפי סטטוס: SUM(total_amount) GROUP BY status - מחשב סה"כ הכנסות לכל סטטוס הזמנה, עוזר לזהות השפעה פיננסית של עיכובים בעיבוד
// 3. ניתוח יעילות עיבוד: ספירה גבוהה של pending = צווארי בקבוק פוטנציאליים, ספירה גבוהה של cancelled = בעיות שביעות רצון לקוחות פוטנציאליות
async function getOrderStatusAnalytics(startDate, endDate) {
    try {
        const db = await dbSingleton.getConnection();
        
        const [statusDistribution] = await db.query(`
            SELECT 
                status,
                COUNT(*) as count,
                SUM(total_amount) as total_revenue
            FROM orders
            WHERE created_at BETWEEN ? AND ?
            GROUP BY status
            ORDER BY count DESC
        `, [startDate, endDate]);

        return statusDistribution;
    } catch (err) {
        console.error('Error in getOrderStatusAnalytics:', err);
        throw err;
    }
}

// קבלת מוצרים מובילים על בסיס ביצועי מכירות
// מחשבת מוצרים מובילים באמצעות אנליטיקס מכירות מורכב:
// - טווח זמן ניתן להגדרה (7d, 30d, 90d, 1y)
// - הגבלת תוצאות ניתן להגדרה
// - מערכת דירוג רב-קריטריונית
// - סינון זמינות מלאי
// 
// חישובים מורכבים:
// 1. חישוב טווח זמן דינמי: מקבל טווח זמן מוגדר מטבלת הגדרות, מחשב תאריך התחלה לפי תאריך נוכחי וטווח זמן
// 2. מטריקות ביצועי מכירות: Order Count (COUNT), Quantity Sold (SUM), Revenue Generated (SUM)
// 3. מערכת דירוג רב-קריטריונית: ראשוני - total_quantity_sold DESC, משני - total_revenue DESC
// 4. מסנני איכות נתונים: p.stock_quantity > 0, HAVING total_quantity_sold > 0, o.status != 'cancelled'
// 5. אסטרטגיית LEFT JOIN: משתמש ב-LEFT JOIN לכלול מוצרים ללא מכירות, מסנן לא-מוכרים עם HAVING
// 6. ניהול הגדרות: מקבל הגדרות ממסד נתונים, תומך בשינויי הגדרות בזמן ריצה
async function getBestSellers(limit = undefined) {
    try {
        const db = await dbSingleton.getConnection();
        const Settings = require('./Settings');
        
        // קביעת הגבלה לשימוש:
        // - אם limit הוא undefined, שימוש בהגבלה מוגדרת מהגדרות
        // - אם limit הוא null, שימוש ב-null (ללא LIMIT clause)
        // - אם limit הוא מספר, שימוש במספר זה
        let actualLimit;
        if (limit === undefined) {
            actualLimit = parseInt(await Settings.getSetting('homepage_display_limit', '8'));
        } else {
            actualLimit = limit;
        }

        // בניית שאילתה - כל הזמנות (ללא סינון תאריכים)
        // מחזיר רק מוצרים שנמכרו (total_quantity_sold > 0)
        // מסודר לפי כמות (quantity) ולא לפי הכנסות (revenue)
        let query = `
            SELECT 
                p.id,
                p.id as product_id,
                p.name,
                p.description,
                p.price,
                p.image_urls as images,
                p.sizes,
                p.category_id,
                p.stock_quantity,
                p.created_at,
                COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN oi.quantity ELSE 0 END), 0) as total_quantity_sold
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.order_id
                AND o.status != 'cancelled'
            WHERE p.stock_quantity > 0
                AND p.is_active = 1
            GROUP BY p.id
            HAVING COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN oi.quantity ELSE 0 END), 0) > 0
            ORDER BY total_quantity_sold DESC
        `;
        
        const queryParams = [];
        
        // הוספת LIMIT clause רק אם limit מוגדר (לא null/undefined)
        if (actualLimit !== null && actualLimit !== undefined) {
            query += ' LIMIT ?';
            queryParams.push(actualLimit);
        }

        const [bestSellers] = await db.query(query, queryParams);

        return {
            products: bestSellers,
            timeRange: 'all', // Hardcoded to all time
            limit: actualLimit,
            totalFound: bestSellers.length
        };

    } catch (err) {
        console.error('Error in getBestSellers:', err);
        throw err;
    }
}

// קבלת אנליטיקס משתמשים לטווח תאריכים מסוים
const getUserAnalytics = async (startDate, endDate) => {
    try {
        const db = await dbSingleton.getConnection();
        
        // קבלת ספירת משתמשים חדשים (משתמשים שהצטרפו בטווח התאריכים)
        const [newUsersRows] = await db.query(`
            SELECT COUNT(*) as newUsers
            FROM users 
            WHERE role = 'customer' 
            AND DATE(created_at) BETWEEN ? AND ?
        `, [startDate, endDate]);
        
        const newUsers = parseInt(newUsersRows[0].newUsers) || 0;
        
        // קבלת משתמשים פעילים (משתמשים שביצעו הזמנות בטווח התאריכים)
        const [activeUsersRows] = await db.query(`
            SELECT COUNT(DISTINCT user_id) as activeUsers
            FROM orders
            WHERE DATE(created_at) BETWEEN ? AND ?
            AND status != 'cancelled'
        `, [startDate, endDate]);
        
        const activeUsers = parseInt(activeUsersRows[0].activeUsers) || 0;
        
        // קבלת משתמשים חוזרים (משתמשים עם מספר הזמנות בטווח התאריכים)
        const [returningUsersRows] = await db.query(`
            SELECT COUNT(DISTINCT user_id) as returningUsers
            FROM (
                SELECT user_id
                FROM orders
                WHERE DATE(created_at) BETWEEN ? AND ?
                AND status != 'cancelled'
                GROUP BY user_id
                HAVING COUNT(*) > 1
            ) as returning_customers
        `, [startDate, endDate]);
        
        const returningUsers = parseInt(returningUsersRows[0].returningUsers) || 0;
        
        // קבלת צמיחת משתמשים לאורך זמן (הרשמות יומיות)
        const [userGrowthData] = await db.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM users
            WHERE role = 'customer'
            AND DATE(created_at) BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [startDate, endDate]);
        
        // קבלת ספירת סה"כ משתמשים (לפני טווח התאריכים להשוואה)
        const [totalUsersRows] = await db.query(`
            SELECT COUNT(*) as totalUsers
            FROM users
            WHERE role = 'customer'
            AND DATE(created_at) < ?
        `, [startDate]);
        
        const totalUsersBefore = parseInt(totalUsersRows[0].totalUsers) || 0;
        
        // חישוב שיעור צמיחה
        const growthRate = totalUsersBefore > 0 
            ? ((newUsers / totalUsersBefore) * 100).toFixed(2)
            : (newUsers > 0 ? '100.00' : '0.00');
        
        return {
            newUsers,
            activeUsers,
            returningUsers,
            totalUsersBefore,
            growthRate: parseFloat(growthRate),
            userGrowth: userGrowthData || []
        };
        
    } catch (error) {
        throw error;
    }
};

// קבלת אנליטיקס רשימת משתמשים עם סטטיסטיקות הזמנות
// מחזיר רק משתמשים שיש להם לפחות הזמנה אחת בטווח התאריכים
async function getUserListAnalytics(startDate, endDate) {
    try {
        const db = await dbSingleton.getConnection();
        
        const [userList] = await db.query(`
            SELECT 
                u.id,
                u.full_name as name,
                u.email,
                u.created_at as joinedDate,
                COUNT(DISTINCT o.order_id) as orders,
                COALESCE(SUM(o.total_amount), 0) as totalSpent,
                MAX(o.created_at) as lastOrder
            FROM users u
            INNER JOIN orders o ON u.id = o.user_id 
                AND o.status != 'cancelled'
                AND DATE(o.created_at) BETWEEN ? AND ?
            WHERE u.role = 'customer'
            GROUP BY u.id, u.full_name, u.email, u.created_at
            HAVING COUNT(DISTINCT o.order_id) > 0
            ORDER BY u.created_at DESC
        `, [startDate, endDate]);
        
        return userList;
    } catch (err) {
        console.error('Error in getUserListAnalytics:', err);
        throw err;
    }
}

// קבלת אנליטיקס מכירות ספציפי לגדלים למוצר
// מנתח נתוני מכירות לפי גדל למוצר ספציפי:
// - כמות נמכרה לגדל
// - הכנסות שנוצרו לגדל
// - ספירת הזמנות לגדל
// - כמות ממוצעת להזמנה לגדל
async function getProductSizeAnalytics(productId, startDate, endDate) {
    try {
        const db = await dbSingleton.getConnection();
        
        const [sizeAnalytics] = await db.query(`
            SELECT 
                oi.selected_size as size,
                COUNT(oi.order_id) as order_count,
                SUM(oi.quantity) as total_quantity_sold,
                SUM(oi.quantity * p.price) as total_revenue,
                AVG(oi.quantity) as avg_quantity_per_order
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE oi.product_id = ?
            AND o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            AND oi.selected_size IS NOT NULL
            AND oi.selected_size != ''
            GROUP BY oi.selected_size
            ORDER BY CAST(oi.selected_size AS UNSIGNED) ASC
        `, [productId, startDate, endDate]);

        return sizeAnalytics;
    } catch (err) {
        console.error('Error in getProductSizeAnalytics:', err);
        throw err;
    }
}

// קבלת אנליטיקס התפלגות גדלים כולל על פני כל המוצרים
// מנתח נתוני מכירות לפי גדל על פני כל המוצרים:
// - כמות נמכרה לגדל
// - הכנסות שנוצרו לגדל
// - ספירת הזמנות לגדל
async function getOverallSizeAnalytics(startDate, endDate) {
    try {
        const db = await dbSingleton.getConnection();
        
        const [sizeAnalytics] = await db.query(`
            SELECT 
                oi.selected_size as size,
                COUNT(DISTINCT oi.order_id) as order_count,
                SUM(oi.quantity) as total_quantity_sold,
                SUM(oi.quantity * p.price) as total_revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            AND oi.selected_size IS NOT NULL
            AND oi.selected_size != ''
            GROUP BY oi.selected_size
            ORDER BY CAST(oi.selected_size AS UNSIGNED) ASC
        `, [startDate, endDate]);

        return sizeAnalytics;
    } catch (err) {
        console.error('Error in getOverallSizeAnalytics:', err);
        throw err;
    }
}

// קבלת סטטיסטיקות מוצרים
// מחזיר סטטיסטיקות כלליות על מוצרים וקטגוריות
async function getProductStats() {
    try {
        const db = await dbSingleton.getConnection();
        
        const [productStats] = await db.query(`
            SELECT 
                COUNT(*) as total_products,
                COUNT(DISTINCT category_id) as total_categories,
                SUM(stock_quantity) as total_stock,
                AVG(price) as avg_price
            FROM products
        `);

        const [productsByCategory] = await db.query(`
            SELECT 
                c.category_name,
                COUNT(p.id) as product_count,
                SUM(p.stock_quantity) as total_stock
            FROM categories c
            LEFT JOIN products p ON c.category_id = p.category_id
            GROUP BY c.category_id
            ORDER BY product_count DESC
        `);

        return {
            productStats: productStats[0],
            productsByCategory
        };
    } catch (err) {
        console.error('Error in getProductStats:', err);
        throw err;
    }
}

module.exports = {
    getRevenueAnalytics,
    getProductAnalytics,
    getProductMetrics,
    getOrderStatusAnalytics,
    getBestSellers,
    getUserAnalytics,
    getUserListAnalytics,
    getProductSizeAnalytics,
    getOverallSizeAnalytics,
    getProductStats
};

