// קובץ פונקציות עזר - מכיל פונקציות שימושיות ברחבי האפליקציה
// בעיקר פונקציות מיון וטיפול בנתונים

/**
 * פונקציה למיון מוצרים לפי קריטריונים שונים
 * @param {Array} products - מערך המוצרים למיון
 * @param {string} sortBy - סוג המיון (ברירת מחדל: 'name')
 * @returns {Array} מערך ממוין של המוצרים
 */
export const sortProducts = (products, sortBy = 'name') => {
    // יצירת עותק של המערך כדי לא לשנות את המערך המקורי
    const sortedProducts = [...products];
    
    // מיון לפי סוג המיון שנבחר
    switch (sortBy) {
        case 'name':
            // מיון אלפביתי לפי שם המוצר (A-Z)
            return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            
        case 'price-low':
            // מיון לפי מחיר מהנמוך לגבוה
            return sortedProducts.sort((a, b) => a.price - b.price);
            
        case 'price-high':
            // מיון לפי מחיר מהגבוה לנמוך
            return sortedProducts.sort((a, b) => b.price - a.price);
            
        case 'newest':
            // מיון לפי תאריך יצירה - החדש ביותר קודם
            return sortedProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            
        case 'oldest':
            // מיון לפי תאריך יצירה - הישן ביותר קודם
            return sortedProducts.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
            
        default:
            // אם לא נבחר סוג מיון תקין, מחזיר את המערך ללא שינוי
            return sortedProducts;
    }
};