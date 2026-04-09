// מודל המוצרים - מנהל את כל הפעולות הקשורות למוצרים במסד הנתונים
// מתחבר לבסיס הנתונים דרך dbSingleton לביצוע שאילתות
const dbSingleton = require('../config/database');
const { normalizeImageUrls, imageUrlsToString } = require('../utils/image');
// פונקציה עזר לחישוב סה"כ מלאי מגדלים
// מחשבת את סכום כל הכמויות מכל הגדלים
function calculateTotalStock(sizes) {
    if (!sizes || !Array.isArray(sizes)) return 0;
    return sizes.reduce((total, sizeObj) => total + (sizeObj.quantity || 0), 0);
}

// פונקציה עזר לקבלת גדלים זמינים עם כמויות
// מחזירה רק גדלים שיש להם כמות גדולה מ-0
function getAvailableSizes(sizes) {
    if (!sizes || !Array.isArray(sizes)) return [];
    return sizes.filter(sizeObj => sizeObj.quantity > 0);
}

// פונקציה עזר לעיבוד מוצר - ממירה תמונות וגדלים לפורמט נכון
function processProductData(product) {
    const normalizedImageUrls = normalizeImageUrls(product.image_urls, 'products');

    let sizes = [];
    if (product.sizes) {
        try {
            sizes = JSON.parse(product.sizes);
        } catch (e) {
            sizes = [];
        }
    }

    return {
        images: normalizedImageUrls,
        sizes,
        fullImageUrls: normalizedImageUrls
    };
}

// קבלת כל המוצרים עבור אדמין - כולל כל המידע
// מחזיר: כל המוצרים (פעילים ולא פעילים), כולל מוצרים ללא מלאי
// כולל: מטריקות מכירות, שדות לוג, אובייקט category
async function getAllProductsForAdmin() {
    try {
        const db = await dbSingleton.getConnection();
        
        // שאילתה מלאה עם כל המידע לאדמין
        const [rows] = await db.query(`
            SELECT 
                p.*,
                c.category_name,
                COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN oi.quantity ELSE 0 END), 0) as total_quantity_sold,
                COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN oi.quantity * p.price ELSE 0 END), 0) as total_revenue,
                COUNT(DISTINCT CASE WHEN o.status != 'cancelled' THEN oi.order_id END) as total_sales
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.order_id
            GROUP BY p.id, p.name, p.description, p.price, p.image_urls, p.sizes, p.category_id, p.stock_quantity, p.created_at, p.updated_at, p.is_active, c.category_name
            ORDER BY p.id DESC
        `);
        
        // עיבוד כל המוצרים עם כל המידע
        return rows.map(product => {
            const processed = processProductData(product);
            
            return {
                ...product,
                image_urls: processed.fullImageUrls.join(','),
                images: processed.fullImageUrls,
                sizes: processed.sizes,
                available_sizes: getAvailableSizes(processed.sizes),
                total_stock: calculateTotalStock(processed.sizes),
                is_active: product.is_active !== undefined ? product.is_active : 1,
                category_name: product.category_name, // הוספת category_name ישירות לאובייקט
                category: {
                    id: product.category_id,
                    name: product.category_name
                }
                // כולל: total_quantity_sold, total_revenue, total_sales, created_at, updated_at
            };
        });
    } catch (err) {
        throw new Error('Failed to fetch products from database');
    }
}

// קבלת מוצרים עבור לקוחות - רק מוצרים פעילים עם מלאי
// מחזיר: רק מוצרים פעילים (is_active = 1) עם מלאי (stock > 0)
// לא כולל: מטריקות מכירות, שדות לוג, אובייקט category, available_sizes
async function getAllProductsForCustomer() {
    try {
        const db = await dbSingleton.getConnection();
        
        // שאילתה מינימלית ללקוחות - רק מוצרים פעילים
        const [rows] = await db.query(`
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.image_urls,
                p.sizes,
                p.category_id,
                p.stock_quantity,
                p.is_active,
                p.color,
                p.homepage_display,
                c.category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.is_active = 1
            ORDER BY p.id DESC
        `);
        
        // עיבוד המוצרים - רק מידע נדרש ללקוחות
        const processedProducts = rows.map(product => {
            const processed = processProductData(product);
            const totalStock = calculateTotalStock(processed.sizes);
            
            // רק מוצרים עם מלאי
            if (totalStock <= 0 && (!product.stock_quantity || product.stock_quantity <= 0)) {
                return null; // נסנן אחר כך
            }
            
            return {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                image_urls: processed.fullImageUrls.join(','),
                images: processed.fullImageUrls,
                sizes: processed.sizes,
                category_id: product.category_id,
                category_name: product.category_name,
                stock_quantity: product.stock_quantity,
                total_stock: totalStock,
                is_active: product.is_active,
                color: product.color,
                homepage_display: product.homepage_display
                // לא כולל: total_quantity_sold, total_revenue, total_sales, available_sizes, category object, created_at, updated_at
            };
        }).filter(product => product !== null); // הסרת מוצרים ללא מלאי
        
        return processedProducts;
    } catch (err) {
        throw new Error('Failed to fetch products from database');
    }
}

// פונקציה אחורית לשמירת תאימות - משתמשת בפונקציות החדשות
async function getAllProducts(options = {}) {
    const {
        includeInactive = true,
        includeOutOfStock = true,
        includeMetrics = true,
        includeAuditFields = true
    } = options;

    // אם כל האופציות הן ברירת מחדל (אדמין), השתמש בפונקציית אדמין
    if (includeInactive && includeOutOfStock && includeMetrics && includeAuditFields) {
        return await getAllProductsForAdmin();
    }
    
    // אחרת, השתמש בפונקציית לקוח (אבל זה לא אידיאלי - עדיף לקרוא ישירות)
    // לשמירת תאימות עם קוד קיים
    const customerProducts = await getAllProductsForCustomer();
    
    // אם צריך להכליל מוצרים לא פעילים או ללא מלאי, נצטרך לעשות זאת ידנית
    // אבל זה לא אמור לקרות - עדיף להשתמש בפונקציות החדשות ישירות
    return customerProducts;
}

// יצירת מוצר חדש במסד הנתונים
// פונקציית אדמין: יצירת מוצר חדש במערכת
async function createProduct(productData) {
    try {
        const db = await dbSingleton.getConnection();
        
        // Check if product with same name (case-insensitive) already exists
        const [existingProducts] = await db.query(
            'SELECT id, name FROM products WHERE LOWER(name) = LOWER(?)',
            [productData.name]
        );
        
        if (existingProducts && existingProducts.length > 0) {
            return { 
                success: false, 
                message: 'Product with this name already exists' 
            };
        }
        
        const totalStock = calculateTotalStock(productData.sizes);
        const normalizedImageUrlsString = productData.image_urls
    ? imageUrlsToString(productData.image_urls, 'products')
    : null;
        const [result] = await db.query(
            'INSERT INTO products (category_id, name, price, stock_quantity, description, sizes, image_urls, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                productData.category_id,
                productData.name, 
                productData.price, 
                totalStock,
                productData.description || null,
                productData.sizes ? JSON.stringify(productData.sizes) : null,
                normalizedImageUrlsString,
                productData.is_active !== undefined ? productData.is_active : 1
            ]
        );
        return { success: true, data: result };
    } catch (err) {
        // אם זה שגיאה של שם קיים, נזרוק אותה כמו שהיא
        if (err.message === 'Product with this name already exists') {
            return { success: false, message: err.message };
        }
        throw new Error('Failed to create product in database');
    }
}

// קבלת מוצר לפי מזהה עם מידע על הקטגוריה
async function getProductById(id, dbConnection = null) {
    try {
        const db = dbConnection || await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT 
                p.*,
                c.category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return null;
        }
        
        const product = rows[0];
        
        const normalizedImageUrls = normalizeImageUrls(product.image_urls, 'products');
        
        let sizes = [];
        if (product.sizes) {
            try {
                sizes = JSON.parse(product.sizes);
            } catch (e) {
                sizes = [];
            }
        }
        
        return {
            ...product,
            image_urls: imageUrlsToString(normalizedImageUrls, 'products'),
            images: normalizedImageUrls,
            sizes: sizes,
            available_sizes: getAvailableSizes(sizes),
            total_stock: calculateTotalStock(sizes),
            is_active: product.is_active !== undefined ? product.is_active : 1, // ברירת מחדל: פעיל אם העמודה לא קיימת
            category_name: product.category_name, // הוספת category_name ישירות לאובייקט
            category: {
                id: product.category_id,
                name: product.category_name
            }
        };
    } catch (err) {
        throw new Error('Failed to fetch product from database');
    }
}

// עדכון מוצר במסד הנתונים
async function updateProduct(id, productData) {
    try {
        const db = await dbSingleton.getConnection();
        
        // בדיקה אם מנסים להפעיל מוצר - צריך לוודא שהקטגוריה פעילה
        if (productData.is_active === 1 && productData.category_id) {
            const [categoryRows] = await db.query(
                'SELECT is_active FROM categories WHERE category_id = ?',
                [productData.category_id]
            );
            
            if (categoryRows.length > 0 && categoryRows[0].is_active === 0) {
                throw new Error('Cannot activate product because the category is deactivated');
            }
        }
        
        // קבלת המוצר הקיים כדי לשמור את image_urls ו-sizes אם לא סופקו בעדכון
        const [existingProduct] = await db.query(
            'SELECT image_urls, sizes FROM products WHERE id = ?',
            [id]
        );
        
        if (existingProduct.length === 0) {
            throw new Error('Product not found');
        }
        const normalizedImageUrlsString = productData.image_urls
        ? imageUrlsToString(productData.image_urls, 'products')
        : null;
        // שמירה על image_urls הקיים אם לא סופק בעדכון
        const imageUrlsToSave = normalizedImageUrlsString !== undefined && normalizedImageUrlsString !== null
            ? normalizedImageUrlsString
            : existingProduct[0].image_urls;
        
        // עיבוד sizes - אם זה כבר מחרוזת JSON, נשאיר אותה, אחרת נמיר למערך ואז למחרוזת
        // אם sizes לא סופק, נשמור את הקיים
        let sizesToSave = null;
        if (productData.sizes !== undefined && productData.sizes !== null) {
            if (typeof productData.sizes === 'string') {
                // אם זה כבר מחרוזת, נבדוק אם זה JSON תקין
                try {
                    JSON.parse(productData.sizes); // בדיקה בלבד
                    sizesToSave = productData.sizes; // נשאיר את המחרוזת
                } catch (e) {
                    // אם זה לא JSON תקין, נמיר למערך ואז למחרוזת
                    sizesToSave = JSON.stringify(Array.isArray(productData.sizes) ? productData.sizes : []);
                }
            } else if (Array.isArray(productData.sizes)) {
                // אם זה מערך, נמיר למחרוזת JSON
                sizesToSave = JSON.stringify(productData.sizes);
            } else {
                sizesToSave = JSON.stringify([]);
            }
        } else {
            // אם sizes לא סופק, נשמור את הקיים
            sizesToSave = existingProduct[0].sizes;
        }
        
        // חישוב מלאי כולל - אם sizes לא סופק, נשתמש בקיים
        const sizesForCalculation = productData.sizes !== undefined && productData.sizes !== null
            ? productData.sizes
            : (existingProduct[0].sizes ? JSON.parse(existingProduct[0].sizes) : []);
        const totalStock = calculateTotalStock(sizesForCalculation);
        
        const [result] = await db.query(
            'UPDATE products SET category_id = ?, name = ?, price = ?, stock_quantity = ?, description = ?, sizes = ?, image_urls = ?, is_active = ? WHERE id = ?',
            [
                productData.category_id,
                productData.name,
                productData.price,
                totalStock,
                productData.description,
                sizesToSave,
                imageUrlsToSave,
                productData.is_active !== undefined ? productData.is_active : 1,
                id
            ]
        );
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Error updating product:', err);
        // אם זה שגיאה של קטגוריה לא פעילה, נזרוק אותה כמו שהיא
        if (err.message === 'Cannot activate product because the category is deactivated') {
            throw err;
        }
        throw new Error('Failed to update product in database');
    }
}


// עדכון כל הגדלים של מוצר בבת אחת
// מקבל: productId, מערך של אובייקטים {size, quantity}
// מעדכן: את כל הגדלים ומחשב מחדש את stock_quantity
async function updateProductSizes(productId, sizesArray) {
    try {
        const db = await dbSingleton.getConnection();
        
        // בדיקה שהמוצר קיים
        const product = await getProductById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        
        // וידוא ש-sizesArray הוא מערך תקין
        if (!Array.isArray(sizesArray)) {
            throw new Error('Sizes must be an array');
        }
        
        // סינון גדלים תקינים (עם size ו-quantity)
        const validSizes = sizesArray
            .filter(s => s && s.size !== undefined && s.size !== null && s.size !== '')
            .map(s => ({
                size: s.size,
                quantity: parseInt(s.quantity) || 0
            }));
        
        // חישוב סה"כ מלאי
        const totalStock = calculateTotalStock(validSizes);
        
        // עדכון במסד הנתונים
        const [result] = await db.query(
            'UPDATE products SET sizes = ?, stock_quantity = ? WHERE id = ?',
            [JSON.stringify(validSizes), totalStock, productId]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Failed to update product sizes');
        }
        
        return {
            success: true,
            updatedSizes: validSizes,
            totalStock: totalStock
        };
    } catch (err) {
        console.error('Error in updateProductSizes:', err);
        throw err;
    }
}


// פונקציות אנליטיקס לדשבורד
// קבלת מוצרים עם מלאי נמוך (סה"כ)
async function getLowStockProducts(threshold = 10) {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT 
                p.id,
                p.name,
                p.stock_quantity,
                p.price,
                p.sizes,
                c.category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.stock_quantity <= ? AND p.is_active = 1
            ORDER BY p.stock_quantity ASC
        `, [threshold]);
        
        console.log(`Found ${rows.length} products with stock <= ${threshold}`);
        
        const processedRows = rows.map(product => {
            let sizes = [];
            
            if (product.sizes) {
                try {
                    const parsedSizes = JSON.parse(product.sizes);
                    
                    // טיפול בפורמט ישן (מערך של מחרוזות/מספרים) ופורמט חדש (מערך של אובייקטים)
                    if (Array.isArray(parsedSizes)) {
                        if (parsedSizes.length > 0 && typeof parsedSizes[0] === 'object' && parsedSizes[0].size !== undefined) {
                            // פורמט חדש: [{size: 7, quantity: 5}, {size: 8, quantity: 3}]
                            sizes = parsedSizes;
                        } else {
                            // פורמט ישן: ["7", "8", "9", "10"] או [7, 8, 9, 10]
                            // המרה לפורמט חדש על ידי חלוקת מלאי שווה
                            const quantityPerSize = Math.max(1, Math.floor(product.stock_quantity / parsedSizes.length));
                            sizes = parsedSizes.map(sizeStr => ({
                                size: parseInt(sizeStr),
                                quantity: quantityPerSize
                            }));
                        }
                    }
                } catch (e) {
                    sizes = [];
                }
            }
            
            // אם לא נמצאו גדלים, יצירת גדל ברירת מחדל
            if (sizes.length === 0) {
                sizes = [{
                    size: 'Default',
                    quantity: product.stock_quantity || 0
                }];
            }
            
            return {
                ...product,
                quantity: product.stock_quantity, // Add quantity field for frontend
                sizes: sizes,
                low_stock_sizes: sizes.filter(sizeObj => sizeObj.quantity <= threshold)
            };
        });
        
        console.log(`Returning ${processedRows.length} low stock products`);
        return processedRows;
    } catch (err) {
        console.error('Error in getLowStockProducts:', err);
        throw new Error('Failed to fetch low stock products');
    }
}

// קבלת מוצרים עם גדלים במלאי נמוך
async function getProductsWithLowStockSizes(sizeThreshold = 5) {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT 
                p.id,
                p.name,
                p.stock_quantity,
                p.price,
                p.sizes,
                p.image_urls,
                c.category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.is_active = 1
            ORDER BY p.name ASC
        `);
        
        const productsWithLowSizes = [];
        
        for (const product of rows) {
            let sizes = [];
            let lowStockSizes = [];
            
            if (product.sizes) {
                try {
                    const parsedSizes = JSON.parse(product.sizes);
                    
                    if (Array.isArray(parsedSizes) && parsedSizes.length > 0) {
                        if (typeof parsedSizes[0] === 'object' && parsedSizes[0].size !== undefined) {
                            // פורמט חדש עם כמויות
                            sizes = parsedSizes.map(s => ({
                                size: String(s.size),
                                quantity: parseInt(s.quantity) || 0
                            }));
                        } else {
                            // פורמט ישן - הערכת כמויות
                            const quantityPerSize = Math.max(1, Math.floor(product.stock_quantity / parsedSizes.length));
                            sizes = parsedSizes.map(sizeStr => ({
                                size: String(sizeStr),
                                quantity: quantityPerSize
                            }));
                        }
                        
                        // סינון גדלים מתחת לסף
                        lowStockSizes = sizes.filter(s => s.quantity <= sizeThreshold && s.quantity > 0);
                    }
                } catch (e) {
                    // דילוג על מוצרים עם נתוני גדלים לא תקינים
                    continue;
                }
            }
            
            // כלול רק מוצרים שיש להם לפחות גדל אחד מתחת לסף
            if (lowStockSizes.length > 0) {
                // עיבוד כתובות תמונות
                const normalizedImageUrls = normalizeImageUrls(product.image_urls, 'products');
                
                productsWithLowSizes.push({
                    ...product,
                    quantity: product.stock_quantity, // הוספת שדה כמות ל-frontend
                    sizes: sizes,
                    low_stock_sizes: lowStockSizes,
                    low_stock_count: lowStockSizes.length,
                    image_urls: imageUrlsToString(normalizedImageUrls),
                    images: normalizedImageUrls
                });
            }
        }
        
        return productsWithLowSizes;
    } catch (err) {
        console.error('Error in getProductsWithLowStockSizes:', err);
        throw new Error('Failed to fetch products with low stock sizes');
    }
}


// הפחתת מלאי לגדל ספציפי לאחר ביצוע הזמנה
async function decreaseStockForSize(productId, size, quantityToDecrease, dbConnection = null) {
    try {
        const db = dbConnection || await dbSingleton.getConnection();
        
        const product = await getProductById(productId, db);
        if (!product) {
            throw new Error('Product not found');
        }
        
        // מציאת הגדל והפחתת הכמות שלו
        const updatedSizes = product.sizes.map(sizeObj => {
            if (sizeObj.size == size) {
                const newQuantity = sizeObj.quantity - quantityToDecrease;
                if (newQuantity < 0) {
                    throw new Error(`Insufficient stock for size ${size}`);
                }
                return { ...sizeObj, quantity: newQuantity };
            }
            return sizeObj;
        });
        
        const totalStock = calculateTotalStock(updatedSizes);
        
        const [result] = await db.query(
            'UPDATE products SET sizes = ?, stock_quantity = ? WHERE id = ?',
            [JSON.stringify(updatedSizes), totalStock, productId]
        );
        
        return result.affectedRows > 0;
    } catch (err) {
        throw err;
    }
}

// פונקציה לוגיקה פנימית (לקוחות/אדמין): קבלת כמות זמינה לגדל ספציפי
async function getStockForSize(productId, size) {
    try {
        const product = await getProductById(productId);
        if (!product) {
            return 0;
        }
        
        const sizeObj = product.sizes.find(s => s.size == size);
        return sizeObj ? sizeObj.quantity : 0;
    } catch (err) {
        return 0;
    }
}

/**
 * מגדיל את המלאי לגדל ספציפי של מוצר
 * משמש להחזרת מלאי כאשר הזמנה מבוטלת
 * 
 * @param {number} productId - ID של המוצר
 * @param {string|number} size - הגדל להגדלה
 * @param {number} quantityToIncrease - הכמות להגדלה
 * @returns {Promise<boolean>} true אם הצליח
 */
async function increaseStockForSize(productId, size, quantityToIncrease, dbConnection = null) {
    try {
        const db = dbConnection || await dbSingleton.getConnection();
        
        const product = await getProductById(productId, db);
        if (!product) {
            throw new Error('Product not found');
        }
        
        // מציאת הגדל והגדלת הכמות שלו
        let sizeFound = false;
        const updatedSizes = product.sizes.map(sizeObj => {
            if (sizeObj.size == size) {
                sizeFound = true;
                const newQuantity = sizeObj.quantity + quantityToIncrease;
                return { ...sizeObj, quantity: newQuantity };
            }
            return sizeObj;
        });
        
        // אם הגדל לא נמצא, מוסיפים אותו
        if (!sizeFound) {
            updatedSizes.push({ size: size, quantity: quantityToIncrease });
        }
        
        const totalStock = calculateTotalStock(updatedSizes);
        
        const [result] = await db.query(
            'UPDATE products SET sizes = ?, stock_quantity = ? WHERE id = ?',
            [JSON.stringify(updatedSizes), totalStock, productId]
        );
        
        return result.affectedRows > 0;
    } catch (err) {
        throw err;
    }
}

// Get top products with sales data and order dates for frontend filtering
async function getTopProducts() {
    try {
        const db = await dbSingleton.getConnection();
        
        // First get products with sales data
        const [topProducts] = await db.query(`
            SELECT 
                p.id,
                p.name,
                p.price,
                p.category_id,
                c.category_name,
                COUNT(DISTINCT CASE WHEN o.status != 'cancelled' THEN oi.order_id END) as total_sales,
                COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN oi.quantity ELSE 0 END), 0) as total_quantity_sold,
                COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN oi.quantity * p.price ELSE 0 END), 0) as total_revenue
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.order_id
            WHERE p.is_active = 1
            GROUP BY p.id, p.name, p.price, p.category_id, c.category_name
            HAVING total_quantity_sold > 0
            ORDER BY total_quantity_sold DESC, total_revenue DESC
        `);
        
        // Get order dates for each product separately
        const productIds = topProducts.map(p => p.id);
        if (productIds.length === 0) {
            return topProducts.map(product => ({ ...product, order_dates: [] }));
        }
        
        const placeholders = productIds.map(() => '?').join(',');
        const [orderDatesData] = await db.query(`
            SELECT 
                oi.product_id,
                DATE(o.created_at) as order_date
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            WHERE oi.product_id IN (${placeholders})
                AND o.status != 'cancelled'
                AND o.created_at IS NOT NULL
            GROUP BY oi.product_id, DATE(o.created_at)
        `, productIds);
        
        // Group order dates by product_id
        const orderDatesMap = {};
        orderDatesData.forEach(row => {
            if (!orderDatesMap[row.product_id]) {
                orderDatesMap[row.product_id] = [];
            }
            if (row.order_date) {
                // Ensure date is in YYYY-MM-DD format
                const dateStr = typeof row.order_date === 'string' 
                    ? row.order_date 
                    : row.order_date.toISOString().split('T')[0];
                if (!orderDatesMap[row.product_id].includes(dateStr)) {
                    orderDatesMap[row.product_id].push(dateStr);
                }
            }
        });
        
        // Add order_dates to each product and ensure numeric types
        return topProducts.map(product => ({
            ...product,
            total_sales: parseInt(product.total_sales) || 0,
            total_quantity_sold: parseFloat(product.total_quantity_sold) || 0,
            total_revenue: parseFloat(product.total_revenue) || 0,
            price: parseFloat(product.price) || 0,
            order_dates: orderDatesMap[product.id] || []
        }));
    } catch (err) {
        console.error('Get top products error:', err);
        throw new Error('Failed to fetch top products');
    }
}

module.exports = {
    increaseStockForSize,
    getAllProducts, // פונקציה אחורית לשמירת תאימות
    getAllProductsForAdmin, // פונקציה חדשה לאדמין - כל המוצרים עם כל המידע
    getAllProductsForCustomer, // פונקציה חדשה ללקוחות - רק מוצרים פעילים עם מלאי
    getProductById,
    createProduct,
    updateProduct,
    updateProductSizes, // פונקציה לעדכון כל הגדלים בבת אחת
    getLowStockProducts,
    getProductsWithLowStockSizes,
    calculateTotalStock,
    getAvailableSizes,
    decreaseStockForSize,
    getStockForSize,
    getTopProducts
};