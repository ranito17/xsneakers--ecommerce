# תיעוד מלא של הפרונטאנד - Frontend Complete Documentation

מסמך מקיף זה מתעד את כל הפרונטאנד של הפרויקט, כולל מבנה הקוד, קריאות API, קומפוננטות, וארכיטקטורה.

---

## תוכן עניינים

1. [מבנה הפרויקט](#מבנה-הפרויקט)
2. [ארכיטקטורה ועקרונות עיצוב](#ארכיטקטורה-ועקרונות-עיצוב)
3. [קריאות API - ניתוח מקיף](#קריאות-api---ניתוח-מקיף)
4. [תיעוד API מלא](#תיעוד-api-מלא)
5. [קומפוננטות - ניתוח](#קומפוננטות---ניתוח)
6. [פונקציות עזר (Utils)](#פונקציות-עזר-utils)
7. [Contexts ו-Hooks](#contexts-ו-hooks)
8. [עקרונות פיתוח](#עקרונות-פיתוח)

---

## מבנה הפרויקט

```
frontend/
├── src/
│   ├── components/          # קומפוננטות לשימוש חוזר
│   │   ├── admin/           # קומפוננטות אדמין
│   │   ├── auth/            # קומפוננטות אימות
│   │   ├── cart/            # קומפוננטות עגלה
│   │   ├── common/          # קומפוננטות משותפות
│   │   ├── layout/          # קומפוננטות פריסה
│   │   ├── orders/          # קומפוננטות הזמנות
│   │   ├── payment/         # קומפוננטות תשלום
│   │   ├── products/        # קומפוננטות מוצרים
│   │   └── wishlist/        # קומפוננטות wishlist
│   ├── pages/               # דפי האפליקציה
│   │   ├── adminPages/      # דפי אדמין
│   │   └── [other pages]    # דפים נוספים
│   ├── services/            # שירותי API
│   ├── utils/               # פונקציות עזר
│   ├── context/             # React Contexts
│   ├── hooks/               # Custom Hooks
│   └── layout/              # פריסות
```

---

## ארכיטקטורה ועקרונות עיצוב

### עקרון מרכזי: API Calls בדפים העליונים

**כלל זהב**: קריאות API צריכות להיות בדפים העליונים (`pages/`), לא בקומפוננטות.

**יוצאים מן הכלל** (קומפוננטות שמותר להן לעשות API calls):
- `PayPalModal` - modal תשלום מיוחד
- `StockRefuelModal` - modal מיוחד למילוי מלאי
- `Footer` - layout component שצריך לטעון נתונים
- `ContactForm` - form component שצריך לשלוח הודעות

### עקרון: פורמט ולולידציה

**פורמט**:
- פונקציות פורמט כלליות → `utils/` (כמו `formatPrice`, `formatAddress`)
- פורמט ספציפי לדף → בדף העליון לפני העברת props
- קומפוננטות מעצבות רק לתצוגה - לא מעבירות props מעוצבים הלאה

**ולידציה**:
- ולידציה כלליות → `utils/` (כמו `validateAddress`, `validateEmail`)
- ולידציה ספציפית לדף → בדף העליון לפני שליחת הנתונים
- קומפוננטות יכולות לעשות ולידציה בסיסית (required fields)

### עקרון: Services Layer

כל קריאות API עוברות דרך שירותי API ב-`services/`:
- `productApi.js` - מוצרים וקטגוריות
- `orderApi.js` - הזמנות
- `userApi.js` - משתמשים
- `cartApi.js` - עגלת קניות
- `authApi.js` - אימות
- `paymentApi.js` - תשלומים
- ועוד...

---

## קריאות API - ניתוח מקיף

### דפים (Pages) - מיקום קריאות API

#### `pages/WishlistPage.jsx`
**API Calls**:
- `userApi.getWishlist()` - טוען את רשימת המוצרים ב-wishlist
- `productApi.getAllProducts()` - טוען את כל המוצרים לסינון
- `userApi.removeFromWishlist()` - מסיר מוצר מה-wishlist

**פונקציות חשובות**:
- `loadWishlist()` - טוען את רשימת המוצרים ב-wishlist מהשרת
- `handleRemoveFromWishlist()` - מסיר מוצר מה-wishlist

---

#### `pages/PaymentPage.jsx`
**API Calls**:
- `userApi.getProfile()` - טוען פרופיל משתמש לקבלת כתובת שמורה
- `orderApi.placeOrder()` - שולח הזמנה חדשה לשרת

**פונקציות חשובות**:
- `fetchUserProfile()` - טוען את פרופיל המשתמש לקבלת כתובת שמורה
- `handleSubmit()` - שולח הזמנה חדשה לשרת
- `validatePaymentAddress()` - בודק תקינות כתובת משלוח
- `validatePaymentMethod()` - בודק תקינות שיטת תשלום

**פונקציות עזר**:
- משתמש ב-`calculateOrderSummary`, `formatPrice`, `formatTaxRate` מ-`price.utils.js`
- משתמש ב-`formatAddress`, `validateAddress` מ-`user.utils.js`

---

#### `pages/ProductsPage.jsx`
**API Calls**:
- `productApi.getProducts()` - טוען את כל המוצרים
- `productApi.getCategories()` - טוען את כל הקטגוריות
- `analyticsApi.getBestSellers()` - טוען את המוצרים הנמכרים ביותר

**פונקציות חשובות**:
- `fetchProducts()` - טוען את כל המוצרים מהשרת
- `fetchCategories()` - טוען את כל הקטגוריות מהשרת
- `fetchBestSellers()` - טוען את המוצרים הנמכרים ביותר
- `loadWishlist()` - טוען את ה-wishlist
- `handleAddToWishlist()` - מוסיף מוצר ל-wishlist
- `handleRemoveFromWishlist()` - מסיר מוצר מה-wishlist

**פונקציות עזר**:
- משתמש ב-`formatSizesForCustomer` מ-`product.utils.js`

---

#### `pages/HomePage.jsx`
**API Calls**:
- `productApi.getProducts()` - טוען מוצרים לדף הבית
- `productApi.getCategories()` - טוען קטגוריות לדף הבית
- `analyticsApi.getBestSellers()` - טוען מוצרים נמכרים ביותר

**פונקציות חשובות**:
- `fetchProducts()` - טוען מוצרים לדף הבית
- `fetchCategories()` - טוען קטגוריות לדף הבית
- `fetchBestSellers()` - טוען מוצרים נמכרים ביותר
- `loadWishlist()` - טוען את ה-wishlist
- `handleAddToWishlist()` - מוסיף מוצר ל-wishlist
- `handleRemoveFromWishlist()` - מסיר מוצר מה-wishlist

**פונקציות עזר**:
- משתמש ב-`formatSizesForCustomer` מ-`product.utils.js`

**⚠️ הערה**: יש חזרתיות עם `ProductsPage.jsx` - אפשר לשקול custom hooks בעתיד

---

#### `pages/ProfilePage.jsx`
**API Calls**:
- `userApi.getProfile()` - טוען את פרופיל המשתמש
- `userApi.updateProfile()` - מעדכן מידע אישי
- `userApi.updateAddress()` - מעדכן כתובת
- `userApi.changePassword()` - משנה סיסמה

**פונקציות חשובות**:
- `fetchProfile()` - טוען את פרופיל המשתמש
- `handlePersonalInfoSubmit()` - מעדכן מידע אישי
- `handleAddressSubmit()` - מעדכן כתובת
- `handlePasswordSubmit()` - משנה סיסמה

**פונקציות עזר**:
- משתמש ב-`validateProfileUpdate`, `validateAddress`, `validatePasswordChange`, `formatAddress`, `formatUserName`, `getUserInitials`, `getUserRoleLabel` מ-`user.utils.js`
- משתמש ב-`formatDate` מ-`date.utils.js`

---

#### `pages/OrderPage.jsx`
**API Calls**:
- `orderApi.getUserOrders()` - טוען את כל ההזמנות של המשתמש
- `orderApi.getOrderById()` - טוען פרטי הזמנה ספציפית
- `orderApi.getOrderItems()` - טוען פריטי הזמנה

**פונקציות חשובות**:
- `fetchOrders()` - טוען את כל ההזמנות של המשתמש
- `handleViewDetails()` - טוען פרטי הזמנה ספציפית

---

#### `pages/adminPages/DashboardPage.jsx`
**API Calls**:
- `orderApi.getDashboardStats()` - סטטיסטיקות דשבורד
- `productApi.getLowStockProducts()` - מוצרים עם מלאי נמוך
- `productApi.getProductStats()` - סטטיסטיקות מוצרים
- `orderApi.getFilteredRecentOrders()` - הזמנות אחרונות מסוננות
- `productApi.getProductsWithLowStockSizes()` - מוצרים עם מלאי נמוך לפי גדל
- `productApi.getLowStockProducts()` - מוצרים עם מלאי נמוך
- `orderApi.getOrderById()` - פרטי הזמנה
- `orderApi.getOrderItems()` - פריטי הזמנה
- `productApi.getProductById()` - פרטי מוצר
- `messageApi.createMessage()` - יצירת הודעה

**פונקציות חשובות**:
- `fetchDashboardData()` - טוען את כל נתוני הדשבורד במקביל
- `handleOrderFiltersChange()` - טוען הזמנות מסוננות לפי פילטרים
- `handleLowStockViewModeChange()` - מחליף בין תצוגת מלאי נמוך כולל/לפי גדל
- `handleOrderClick()` - טוען פרטי הזמנה למודל
- `handleProductClick()` - טוען פרטי מוצר למודל
- `handleContactModalSubmit()` - שולח הודעה דרך המודל

---

#### `pages/adminPages/ProductManagment.jsx`
**API Calls**:
- `productApi.getAllProducts()` - טוען את כל המוצרים לניהול
- `categoryApi.getCategories()` - טוען את כל הקטגוריות
- `productApi.deleteProduct()` - מוחק מוצר (רק אם לא פעיל)
- `productApi.createProduct()` - שומר מוצר חדש
- `productApi.updateProduct()` - מעדכן מוצר קיים
- `uploadApi.uploadProductImages()` - מעלה תמונות למוצר
- `uploadApi.deleteAllProductImages()` - מוחק את כל התמונות
- `uploadApi.deleteProductImage()` - מוחק תמונה אחת
- `productApi.deactivateProduct()` - מפסיק מוצר
- `productApi.activateProduct()` - מפעיל מוצר

**פונקציות חשובות**:
- `loadProducts()` - טוען את כל המוצרים לניהול
- `loadCategories()` - טוען את כל הקטגוריות
- `handleDeleteProduct()` - מוחק מוצר (רק אם לא פעיל)
- `handleSaveProduct()` - שומר מוצר חדש או מעדכן קיים
- `handleSaveSizes()` - מעדכן גדלים וכמויות של מוצר
- `handleImageUpload()` - מעלה תמונות למוצר
- `handleImageDelete()` - מוחק תמונה אחת או את כל התמונות
- `handleDeactivateProduct()` - מפסיק מוצר
- `handleActivateProduct()` - מפעיל מוצר

---

#### `pages/adminPages/OrderManagmentPage.jsx`
**API Calls**:
- `orderApi.getAllOrders()` - טוען את כל ההזמנות
- `orderApi.getOrderItems()` - טוען פריטי הזמנה (בתוך `fetchOrders` לכל ההזמנות)
- `orderApi.updateOrderStatus()` - מעדכן סטטוס הזמנה

**פונקציות חשובות**:
- `fetchOrders()` - טוען את כל ההזמנות עם פריטי ההזמנה
- `handleStatusUpdate()` - מעדכן סטטוס הזמנה

**שינוי חשוב**: `orderItems` נטען מראש לכל ההזמנות ומועבר כ-prop ל-`AdminOrderModal`

---

#### `pages/adminPages/UserManagmentPage.jsx`
**API Calls**:
- `userApi.getAllUsers()` - טוען את כל המשתמשים
- `userApi.getUserCart()` - טוען את עגלת הקניות של משתמש
- `messageApi.sendMessage()` - שולח הודעה למשתמש
- `userApi.deleteUser()` - מוחק משתמש

**פונקציות חשובות**:
- `fetchUsers()` - טוען את כל המשתמשים
- `fetchUserOrderCounts()` - טוען מספר הזמנות לכל המשתמשים
- `handleViewCart()` - טוען את עגלת הקניות של משתמש
- `handleMessageSubmit()` - שולח הודעה למשתמש
- `handleDeleteUser()` - מוחק משתמש

**שינויים חשובים**:
- `UserCard` מקבל `orderCount` ו-`loadingOrders` כ-props
- `UserModal` מקבל `onUserDeleted` handler
- כל קריאות ה-API נעשות בדף העליון

---

### קומפוננטות (Components) - API Calls

#### ✅ קומפוננטות עם API Calls - מותר

1. **`components/payment/PayPalModal.jsx`**
   - `paymentApi.createPayPalOrder()` - יוצר הזמנת PayPal
   - `paymentApi.capturePayPalOrder()` - מבצע תשלום PayPal
   - ✅ **OK** - זה modal תשלום מיוחד, מותר לו לעשות API calls

2. **`components/admin/dashboard/StockRefuelModal.jsx`**
   - `productApi.getProductsWithLowStockSizes()` - טוען מוצרים עם מלאי נמוך לפי גדל
   - `supplierApi.sendStockRefuelEmail()` - שולח בקשת מילוי מלאי לספק
   - ✅ **OK** - זה modal מיוחד למילוי מלאי, מותר לו לעשות API calls

3. **`components/layout/footer/Footer.jsx`**
   - `settingsApi.getPublicSettings()` - טוען הגדרות ציבוריות
   - `productApi.getCategories()` - טוען קטגוריות
   - ✅ **OK** - זה layout component שצריך לטעון נתונים לעצמו

4. **`components/contactForm/ContactForm.jsx`**
   - `messageApi.createMessage()` - יוצר הודעה
   - ✅ **OK** - זה form component שצריך לשלוח הודעות

---

#### ✅ קומפוננטות עם API Calls - תוקן!

1. **`components/admin/users/userCard/UserCard.jsx`**
   - ✅ **תוקן!** - עכשיו מקבל `orderCount` ו-`loadingOrders` כ-props מ-`UserManagmentPage.jsx`
   - ה-API call נעשה ב-`UserManagmentPage.jsx` בפונקציה `fetchUserOrderCounts()`

2. **`components/admin/users/userModal/UserModal.jsx`**
   - ✅ **תוקן!** - עכשיו מקבל `onUserDeleted` handler מ-`UserManagmentPage.jsx`
   - ה-API call נעשה ב-`UserManagmentPage.jsx` בפונקציה `handleDeleteUser()`

3. **`components/admin/orders/adminOrderModal/AdminOrderModal.jsx`**
   - ✅ **תוקן!** - עכשיו מקבל `orderItems` כ-prop מ-`OrderManagmentPage.jsx`
   - ה-API call נעשה ב-`OrderManagmentPage.jsx` בפונקציה `fetchOrders()` (טוען את כל ה-orderItems לכל ההזמנות)

---

#### `components/products/productCard/productCard.jsx`
**הערה חשובה**:
- הקומפוננטה משתמשת ב-hooks/context (`useCart`, `userApi`) ל-API calls
- זה בסדר כי הם חלק מה-logic של הקומפוננטה
- הקומפוננטה מקבלת `isInWishlist`, `onAddToWishlist`, `onRemoveFromWishlist` כ-props מה-parent pages (`ProductsPage`, `HomePage`)

---

## תיעוד API מלא

### Product API

#### `getAllProducts()`
**מיקום**: `services/productApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/productRoutes/`  
**תיאור**: מקבל את כל המוצרים מהשרת  
**Response**: Array of products  
**שימוש**: `ProductManagment.jsx`, `ProductsPage.jsx`, `HomePage.jsx`

#### `getProductById(productId)`
**מיקום**: `services/productApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/productRoutes/${productId}`  
**תיאור**: מקבל מוצר ספציפי לפי ID  
**Response**: Product object  
**שימוש**: `DashboardPage.jsx`

#### `createProduct(productData)`
**מיקום**: `services/productApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/productRoutes/`  
**תיאור**: יוצר מוצר חדש  
**Request Body**: `{ name, description, price, stock_quantity, category_id, sizes, is_active }`  
**Response**: `{ success, message, productId }`  
**שימוש**: `ProductManagment.jsx`

#### `updateProduct(productId, productData)`
**מיקום**: `services/productApi.js`  
**Method**: `PUT`  
**Endpoint**: `/api/productRoutes/${productId}`  
**תיאור**: מעדכן מוצר קיים  
**Request Body**: זהה ל-`createProduct()`  
**Response**: `{ success, message, data }`  
**שימוש**: `ProductManagment.jsx`

#### `deleteProduct(productId)`
**מיקום**: `services/productApi.js`  
**Method**: `DELETE`  
**Endpoint**: `/api/productRoutes/${productId}`  
**תיאור**: מוחק מוצר (רק אם לא פעיל)  
**Response**: `{ success, message }`  
**שימוש**: `ProductManagment.jsx`

#### `deactivateProduct(productId)`
**מיקום**: `services/productApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/productRoutes/${productId}/deactivate`  
**תיאור**: מפסיק מוצר (מגדיר is_active ל-0)  
**Response**: `{ success, message, data }`  
**שימוש**: `ProductManagment.jsx`

#### `activateProduct(productId)`
**מיקום**: `services/productApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/productRoutes/${productId}/activate`  
**תיאור**: מפעיל מוצר (מגדיר is_active ל-1)  
**Response**: `{ success, message, data }`  
**שימוש**: `ProductManagment.jsx`

#### `getCategories()`
**מיקום**: `services/productApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/categoryRoutes/`  
**תיאור**: מקבל את כל הקטגוריות  
**Response**: Array of categories  
**שימוש**: `ProductManagment.jsx`, `ProductsPage.jsx`, `HomePage.jsx`

#### `getLowStockProducts(threshold)`
**מיקום**: `services/productApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/productRoutes/dashboard/low-stock?threshold=${threshold}`  
**תיאור**: מקבל מוצרים עם מלאי נמוך  
**Response**: Array of products  
**שימוש**: `DashboardPage.jsx`

#### `getProductsWithLowStockSizes(sizeThreshold)`
**מיקום**: `services/productApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/productRoutes/dashboard/low-stock-sizes?sizeThreshold=${sizeThreshold}`  
**תיאור**: מקבל מוצרים עם מלאי נמוך לפי גדל  
**Response**: Array of products  
**שימוש**: `DashboardPage.jsx`, `StockRefuelModal.jsx`

#### `getProductStats()`
**מיקום**: `services/productApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/productRoutes/dashboard/stats`  
**תיאור**: מקבל סטטיסטיקות מוצרים  
**Response**: `{ productStats: { total_products, total_categories, total_stock, avg_price } }`  
**שימוש**: `DashboardPage.jsx`

---

### Order API

#### `placeOrder(orderData)`
**מיקום**: `services/orderApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/orderRoutes/place`  
**תיאור**: יוצר הזמנה חדשה  
**Request Body**: `{ user_id, total_amount, subtotal, delivery_cost, payment_status, address, items }`  
**Response**: `{ success, message, data: { orderNumber, orderId } }`  
**שימוש**: `PaymentPage.jsx`

#### `getAllOrders()`
**מיקום**: `services/orderApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/orderRoutes`  
**תיאור**: מקבל את כל ההזמנות (אדמין בלבד)  
**Response**: Array of orders  
**שימוש**: `OrderManagmentPage.jsx`

#### `getOrderById(orderId)`
**מיקום**: `services/orderApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/orderRoutes/${orderId}`  
**תיאור**: מקבל הזמנה ספציפית לפי ID  
**Response**: Order object  
**שימוש**: `OrderPage.jsx`, `OrderManagmentPage.jsx`, `DashboardPage.jsx`

#### `updateOrderStatus(orderId, status)`
**מיקום**: `services/orderApi.js`  
**Method**: `PATCH`  
**Endpoint**: `/api/orderRoutes/${orderId}/status`  
**תיאור**: מעדכן סטטוס הזמנה  
**Request Body**: `{ status }` (pending, processing, shipped, delivered, cancelled)  
**Response**: `{ success, message, data }`  
**שימוש**: `OrderManagmentPage.jsx`

**⚠️ חשוב**: כאשר סטטוס משתנה ל-"cancelled", המלאי מוחזר אוטומטית. כאשר מבטלים את הביטול, המלאי מופחת שוב.

#### `getUserOrders(userId)`
**מיקום**: `services/orderApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/orderRoutes/user/${userId}`  
**תיאור**: מקבל את כל ההזמנות של משתמש ספציפי  
**Response**: Array of user orders  
**שימוש**: `OrderPage.jsx`

#### `getOrderItems(orderId)`
**מיקום**: `services/orderApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/orderRoutes/${orderId}/items`  
**תיאור**: מקבל את פריטי ההזמנה  
**Response**: Array of order items  
**שימוש**: `OrderPage.jsx`, `OrderManagmentPage.jsx`, `DashboardPage.jsx`

#### `getDashboardStats()`
**מיקום**: `services/orderApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/orderRoutes/dashboard/stats`  
**תיאור**: מקבל סטטיסטיקות דשבורד  
**Response**: `{ orderStats, recentOrders, topProducts }`  
**שימוש**: `DashboardPage.jsx`

#### `getFilteredRecentOrders(filters)`
**מיקום**: `services/orderApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/orderRoutes/dashboard/recent?${queryParams}`  
**תיאור**: מקבל הזמנות אחרונות מסוננות  
**Query Params**: `limit`, `status`, `startDate`, `endDate`  
**Response**: Array of orders  
**שימוש**: `DashboardPage.jsx`

#### `getBestSellers(limit)`
**מיקום**: `services/orderApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/orderRoutes/analytics/best-sellers`  
**Query Params**: `limit` (optional: number, 'all', or undefined)  
**תיאור**: מקבל את המוצרים הנמכרים ביותר  
**Response**: `{ products: [...] }`  
**שימוש**: `ProductsPage.jsx`, `HomePage.jsx`

---

### User API

#### `getAllUsers()`
**מיקום**: `services/userApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/userRoutes/all`  
**תיאור**: מקבל את כל המשתמשים (אדמין בלבד)  
**Response**: Array of users  
**שימוש**: `UserManagmentPage.jsx`

#### `getProfile()`
**מיקום**: `services/userApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/userRoutes/profile`  
**תיאור**: מקבל את פרופיל המשתמש הנוכחי  
**Response**: User object with profile data  
**שימוש**: `ProfilePage.jsx`, `PaymentPage.jsx`

#### `updateProfile(profileData)`
**מיקום**: `services/userApi.js`  
**Method**: `PUT`  
**Endpoint**: `/api/userRoutes/profile`  
**תיאור**: מעדכן את פרופיל המשתמש  
**Request Body**: `{ full_name, phone_number }`  
**Response**: `{ success, message, data }`  
**שימוש**: `ProfilePage.jsx`

#### `updateAddress(addressData)`
**מיקום**: `services/userApi.js`  
**Method**: `PUT`  
**Endpoint**: `/api/userRoutes/address`  
**תיאור**: מעדכן את כתובת המשתמש  
**Request Body**: `{ house_number, street, city, zipcode }`  
**Response**: `{ success, message, data }`  
**שימוש**: `ProfilePage.jsx`

#### `changePassword(passwordData)`
**מיקום**: `services/userApi.js`  
**Method**: `PUT`  
**Endpoint**: `/api/userRoutes/change-password`  
**תיאור**: משנה את סיסמת המשתמש  
**Request Body**: `{ currentPassword, newPassword }`  
**Response**: `{ success, message }`  
**שימוש**: `ProfilePage.jsx`

#### `getWishlist()`
**מיקום**: `services/userApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/userRoutes/wishlist`  
**תיאור**: מקבל את רשימת ה-wishlist של המשתמש  
**Response**: `{ success, wishlist: [productIds] }`  
**שימוש**: `WishlistPage.jsx`, `productCard.jsx`

#### `addToWishlist(productId)`
**מיקום**: `services/userApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/userRoutes/wishlist`  
**תיאור**: מוסיף מוצר ל-wishlist  
**Request Body**: `{ productId }`  
**Response**: `{ success, message }`  
**שימוש**: `productCard.jsx`

#### `removeFromWishlist(productId)`
**מיקום**: `services/userApi.js`  
**Method**: `DELETE`  
**Endpoint**: `/api/userRoutes/wishlist/${productId}`  
**תיאור**: מסיר מוצר מה-wishlist  
**Response**: `{ success, message }`  
**שימוש**: `WishlistPage.jsx`, `productCard.jsx`

#### `getUserCart(userId)`
**מיקום**: `services/userApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/cartRoutes/admin/user/${userId}`  
**תיאור**: מקבל את עגלת הקניות של משתמש (אדמין בלבד)  
**Response**: Cart items array  
**שימוש**: `UserManagmentPage.jsx`

#### `deleteUser(userId)`
**מיקום**: `services/userApi.js`  
**Method**: `DELETE`  
**Endpoint**: `/api/userRoutes/${userId}`  
**תיאור**: מוחק משתמש  
**Response**: `{ success, message }`  
**שימוש**: `UserManagmentPage.jsx`

---

### Cart API

#### `getCart()`
**מיקום**: `services/cartApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/cartRoutes/cart`  
**תיאור**: מקבל את עגלת הקניות של המשתמש הנוכחי  
**Response**: Cart items array  
**שימוש**: דרך `useCart` hook

#### `addToCart(productId, quantity, selected_size)`
**מיקום**: `services/cartApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/cartRoutes/add`  
**תיאור**: מוסיף מוצר לעגלה  
**Request Body**: `{ productId, quantity, selected_size }`  
**Response**: `{ success, message, data }`  
**שימוש**: דרך `useCart` hook

#### `updateQuantity(cartItemId, quantity)`
**מיקום**: `services/cartApi.js`  
**Method**: `PUT`  
**Endpoint**: `/api/cartRoutes/update/${cartItemId}`  
**תיאור**: מעדכן כמות פריט בעגלה  
**Request Body**: `{ quantity }`  
**Response**: `{ success, message, data }`  
**שימוש**: דרך `useCart` hook

#### `removeFromCart(cartItemId)`
**מיקום**: `services/cartApi.js`  
**Method**: `DELETE`  
**Endpoint**: `/api/cartRoutes/remove/${cartItemId}`  
**תיאור**: מסיר פריט מעגלה  
**Response**: `{ success, message }`  
**שימוש**: דרך `useCart` hook

#### `clearCart()`
**מיקום**: `services/cartApi.js`  
**Method**: `DELETE`  
**Endpoint**: `/api/cartRoutes/clear`  
**תיאור**: מנקה את כל העגלה  
**Response**: `{ success, message }`  
**שימוש**: דרך `useCart` hook

---

### Auth API

#### `checkAuth()`
**מיקום**: `services/authApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/userRoutes/me`  
**תיאור**: בודק אם המשתמש מאומת  
**Response**: `{ success, user }`  
**שימוש**: דרך `useAuth` hook

#### `login(email, password)`
**מיקום**: `services/authApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/userRoutes/login`  
**תיאור**: מתחבר למשתמש  
**Request Body**: `{ email, password }`  
**Response**: `{ success, message, user }`  
**שימוש**: `LoginForm.jsx`

#### `signup(userData)`
**מיקום**: `services/authApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/userRoutes/signup`  
**תיאור**: רושם משתמש חדש  
**Request Body**: `{ full_name, email, password, address, phone_number }`  
**Response**: `{ success, message, user }`  
**שימוש**: `SignupForm.jsx`

#### `logout()`
**מיקום**: `services/authApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/userRoutes/logout`  
**תיאור**: מתנתק מהמשתמש  
**Response**: `{ success, message }`  
**שימוש**: דרך `useAuth` hook

#### `forgotPassword(email)`
**מיקום**: `services/authApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/userRoutes/forgot-password`  
**תיאור**: שולח אימייל לאיפוס סיסמה  
**Request Body**: `{ email }`  
**Response**: `{ success, message }`  
**שימוש**: `ForgotPasswordForm.jsx`

#### `resetPassword(token, newPassword)`
**מיקום**: `services/authApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/userRoutes/reset-password`  
**תיאור**: מאפס סיסמה עם טוקן  
**Request Body**: `{ token, newPassword }`  
**Response**: `{ success, message }`  
**שימוש**: `ResetPasswordPage.jsx`

#### `verifyResetToken(token)`
**מיקום**: `services/authApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/userRoutes/verify-reset-token/${token}`  
**תיאור**: בודק תקינות טוקן איפוס סיסמה  
**Response**: `{ success, valid }`  
**שימוש**: `ResetPasswordPage.jsx`

---

### Payment API

#### `createPayPalOrder(orderData)`
**מיקום**: `services/paymentApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/payments/paypal/create-order`  
**תיאור**: יוצר הזמנת PayPal  
**Request Body**: `{ amount, currency, description }`  
**Response**: `{ success, orderId, status }`  
**שימוש**: `PayPalModal.jsx`

#### `capturePayPalOrder(orderId)`
**מיקום**: `services/paymentApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/payments/paypal/capture-order`  
**תיאור**: מבצע תשלום PayPal  
**Request Body**: `{ orderId }`  
**Response**: `{ success, transactionId, status, amount, currency, payerEmail }`  
**שימוש**: `PayPalModal.jsx`

---

### Message API

#### `getMessages()`
**מיקום**: `services/messageApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/messages`  
**תיאור**: מקבל את כל ההודעות (אדמין בלבד)  
**Response**: Array of messages  
**שימוש**: `MessagesPage.jsx`

#### `createMessage(messageData)` / `sendMessage(messageData)`
**מיקום**: `services/messageApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/messages`  
**תיאור**: יוצר הודעה חדשה  
**Request Body**: `{ subject, message, recipientEmail, messageType, priority, phone, orderId, productId }`  
**Response**: `{ success, message, data }`  
**שימוש**: `DashboardPage.jsx`, `UserManagmentPage.jsx`, `ContactForm.jsx`

#### `updateMessageStatus(messageId, status)`
**מיקום**: `services/messageApi.js`  
**Method**: `PATCH`  
**Endpoint**: `/api/messages/${messageId}/status`  
**תיאור**: מעדכן סטטוס הודעה  
**Request Body**: `{ status }` (unread, read, resolved, archived)  
**Response**: `{ success, message }`  
**שימוש**: `MessagesPage.jsx`

---

### Analytics API

#### `getBestSellers(limit)`
**מיקום**: `services/analyticsApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/orderRoutes/analytics/best-sellers`  
**Query Params**: `limit` (optional)  
**תיאור**: מקבל את המוצרים הנמכרים ביותר  
**Response**: `{ products: [...] }`  
**שימוש**: `ProductsPage.jsx`, `HomePage.jsx`

---

### Upload API

#### `uploadProductImages(productId, files, onProgress)`
**מיקום**: `services/uploadApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/upload/product-images`  
**Headers**: `Content-Type: multipart/form-data`  
**Body**: FormData with `images` (files) and `productId`  
**תיאור**: מעלה תמונות למוצר  
**Response**: `{ success, message, data: { imageUrls } }`  
**שימוש**: `ProductManagment.jsx`

#### `deleteProductImage(productId, imageUrl)`
**מיקום**: `services/uploadApi.js`  
**Method**: `DELETE`  
**Endpoint**: `/api/upload/product-images/${productId}`  
**Request Body**: `{ imageUrl }`  
**תיאור**: מוחק תמונה ספציפית ממוצר  
**Response**: `{ success, message }`  
**שימוש**: `ProductManagment.jsx`

#### `deleteAllProductImages(productId)`
**מיקום**: `services/uploadApi.js`  
**Method**: `DELETE`  
**Endpoint**: `/api/upload/product-images/${productId}/all`  
**תיאור**: מוחק את כל התמונות של מוצר  
**Response**: `{ success, message }`  
**שימוש**: `ProductManagment.jsx`

---

### Supplier API

#### `sendStockRefuelEmail(refuelData)`
**מיקום**: `services/supplierApi.js`  
**Method**: `POST`  
**Endpoint**: `/api/supplier/refuel`  
**Request Body**: `{ products: [{ id, name, sizeQuantities: [{ size, quantity }] }], notes }`  
**תיאור**: שולח אימייל לספק לבקשת מילוי מלאי  
**Response**: `{ success, message }`  
**שימוש**: `StockRefuelModal.jsx`

---

### Settings API

#### `getSettings()`
**מיקום**: `services/settingsApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/settingsRoutes`  
**תיאור**: מקבל הגדרות (דורש אימות)  
**Response**: Settings object  
**שימוש**: דרך `SettingsProvider`

#### `getPublicSettings()`
**מיקום**: `services/settingsApi.js`  
**Method**: `GET`  
**Endpoint**: `/api/settingsRoutes/public`  
**תיאור**: מקבל הגדרות ציבוריות (ללא אימות)  
**Response**: Public settings object  
**שימוש**: דרך `SettingsProvider`, `Footer.jsx`

#### `updateSettings(settingsData)`
**מיקום**: `services/settingsApi.js`  
**Method**: `PUT`  
**Endpoint**: `/api/settingsRoutes`  
**תיאור**: מעדכן הגדרות  
**Request Body**: Settings object with fields to update  
**Response**: `{ success, message, data }`  
**שימוש**: `SettingsPage.jsx`

---

## קומפוננטות - ניתוח

### פונקציות עיצוב בקומפוננטים

**✅ כל הקומפוננטים משתמשים בפונקציות עיצוב רק לתצוגה, לא להעברת props מעוצבים הלאה.**

דוגמאות:
- `ProductCard` - משתמש ב-`formatPrice(product.price)` - רק לתצוגה
- `CartItem` - משתמש ב-`formatPrice(price)` - רק לתצוגה
- `UserCard` - משתמש ב-`formatUserName(user)`, `formatDate(user.created_at)` - רק לתצוגה
- `OrderCard` - משתמש ב-`formatDate`, `formatOrderTotal` - רק לתצוגה
- וכו'...

**סיכום**: הכל בסדר! כל הקומפוננטים משתמשים בפונקציות עיצוב רק לתצוגה.

---

## פונקציות עזר (Utils)

### `utils/price.utils.js`
- `formatPrice(amount, currency)` - מעצב מחיר עם מטבע
- `calculateOrderSummary(items, taxRate, deliverySettings)` - מחשב סיכום הזמנה
- `formatTaxRate(rate)` - מעצב אחוז מס
- `extractTaxFromPrice(price, taxRate)` - מחלץ מס ממחיר
- `getBasePriceFromInclusive(price, taxRate)` - מחשב מחיר בסיס ממחיר כולל מס
- `calculateTaxFromBasePrice(basePrice, taxRate)` - מחשב מס ממחיר בסיס
- `addTaxToBasePrice(basePrice, taxRate)` - מוסיף מס למחיר בסיס
- `calculateDeliveryCost(subtotal, freeDeliveryThreshold, defaultDeliveryCost)` - מחשב עלות משלוח
- `calculateSingleProductSummary(product, quantity, taxRate, deliverySettings)` - מחשב סיכום מוצר בודד
- `validatePrice(price)` - בודק תקינות מחיר
- `validateTaxRate(rate)` - בודק תקינות אחוז מס
- `calculateAdminPrice(price, taxRate)` - מחשב מחיר אדמין
- `getAdminPriceBreakdown(price, taxRate)` - מחזיר פירוט מחיר אדמין

### `utils/user.utils.js`
- `formatUserName(user)` - מעצב שם משתמש
- `formatAddress(address, format)` - מעצב כתובת לתצוגה
- `getUserInitials(user)` - מחזיר ראשי תיבות של שם
- `getUserRoleLabel(role)` - מחזיר תווית תפקיד
- `getUserRoleBadgeClass(role)` - מחזיר class לתג תפקיד
- `getMessageTypeLabel(type)` - מחזיר תווית סוג הודעה
- `getMessagePriorityLabel(priority)` - מחזיר תווית עדיפות הודעה
- `validateProfileUpdate(data)` - בודק תקינות עדכון פרופיל
- `validateAddress(address, required)` - בודק תקינות כתובת
- `validatePasswordChange(data)` - בודק תקינות שינוי סיסמה
- `validateMessageForm(data)` - בודק תקינות טופס הודעה

### `utils/product.utils.js`
- `formatSizesForCustomer(sizes)` - מעצב גדלים לתצוגת לקוח
- `formatSizesForAdmin(sizes)` - מעצב גדלים לתצוגת אדמין
- `applyFilters(products, filters)` - מסנן מוצרים לפי פילטרים
- `getPriceRange(products)` - מחזיר טווח מחירים
- `getSizeRange(products)` - מחזיר טווח גדלים
- `calculateTotalStock(sizes, fallback)` - מחשב סך מלאי
- `validateStockConsistency(sizes, stockQuantity)` - בודק עקביות מלאי
- `parseSizesData(sizes)` - מפרסר נתוני גדלים
- `validateProductForm(data)` - בודק תקינות טופס מוצר
- `validateProductImage(file)` - בודק תקינות תמונת מוצר

### `utils/order.utils.js`
- `filterOrders(orders, filters)` - מסנן הזמנות
- `sortOrders(orders, sortBy, sortOrder)` - ממיין הזמנות
- `getAllAvailableSizes(orderItems)` - מחזיר כל הגדלים הזמינים

### `utils/date.utils.js`
- `formatDate(date, format)` - מעצב תאריך

### `utils/form.validation.js`
- פונקציות ולידציה כלליות לטופסים

### `utils/image.utils.js`
- פונקציות עזר לעיבוד תמונות

### `utils/cartUtils.js`
- פונקציות עזר לעגלת קניות

### `utils/chartUtils.js`
- פונקציות עזר לגרפים

---

## Contexts ו-Hooks

### Contexts

#### `context/AuthProvider.jsx`
**תפקיד**: מספק מצב אימות גלובלי  
**פונקציות חשובות**:
- `checkAuth()` - בודק אם המשתמש מאומת
- `login(email, password)` - מתחבר למשתמש
- `logout()` - מתנתק מהמשתמש

#### `context/CartProvider.jsx`
**תפקיד**: מספק מצב עגלת קניות גלובלי  
**פונקציות חשובות**:
- `loadCart()` - טוען את עגלת הקניות
- `syncGuestCartToBackend()` - מסנכרן עגלת אורח עם השרת
- `addToCart(productId, quantity, selectedSize)` - מוסיף מוצר לעגלה
- `removeFromCart(cartItemId)` - מסיר פריט מעגלה
- `updateQuantity(cartItemId, quantity)` - מעדכן כמות פריט
- `clearCart()` - מנקה את כל העגלה
- `isInCart(productId, selectedSize)` - בודק אם מוצר בעגלה

#### `context/SettingsProvider.jsx`
**תפקיד**: מספק הגדרות גלובליות  
**פונקציות חשובות**:
- `fetchSettings()` - טוען הגדרות (דורש אימות)
- `fetchPublicSettings()` - טוען הגדרות ציבוריות
- `updateSettings(settingsData)` - מעדכן הגדרות
- `getSetting(key, defaultValue)` - מקבל הגדרה ספציפית
- `isLowStock(stockQuantity, threshold)` - בודק אם מלאי נמוך
- `getStockStatus(stockQuantity, threshold)` - מחזיר סטטוס מלאי

### Hooks

#### `hooks/useAuthentication.js`
**תפקיד**: Hook לאימות  
**משתמש ב**: `AuthProvider`

#### `hooks/useCart.js`
**תפקיד**: Hook לעגלת קניות  
**משתמש ב**: `CartProvider`

#### `hooks/useAuthorization.js`
**תפקיד**: Hook להרשאות

---

## עקרונות פיתוח

### 1. API Calls בדפים העליונים
- כל קריאות API צריכות להיות בדפים (`pages/`)
- קומפוננטות מקבלות props מה-parent
- יוצאים מן הכלל: קומפוננטות מיוחדות (PayPalModal, StockRefuelModal, Footer, ContactForm)

### 2. Services Layer
- כל קריאות API עוברות דרך שירותי API ב-`services/`
- לא להשתמש ב-`fetch` ישירות
- טיפול בשגיאות אחיד

### 3. פורמט ולולידציה
- פונקציות פורמט כלליות → `utils/`
- פורמט ספציפי לדף → בדף העליון
- ולידציה → בדף העליון או ב-`utils/`

### 4. פונקציות API
- כל קריאת API בפונקציה נפרדת (לא ישירות ב-onClick)
- טיפול בשגיאות בכל פונקציה
- תיעוד בעברית לכל פונקציה חשובה

### 5. קומפוננטות
- קומפוננטות מעצבות רק לתצוגה
- לא מעבירות props מעוצבים הלאה
- מקבלות handlers מה-parent

---

## סיכום

### ✅ מה עובד טוב:
1. רוב קריאות ה-API נמצאות בדפים העליונים
2. יש שימוש ב-services layer
3. יש פונקציות עזר ב-`utils/` לפורמט ולולידציה
4. כל הקומפוננטות משתמשות בפונקציות עיצוב רק לתצוגה

### ✅ תיקונים שבוצעו:
1. **PayPalModal** - ✅ תוקן - עכשיו משתמש ב-`paymentApi` במקום `fetch` ישירות
2. **deactivateProduct/activateProduct** - ✅ נוספו handlers ב-`ProductManagment.jsx`
3. **UserCard, UserModal, AdminOrderModal** - ✅ תוקן - API calls הועברו לדפים העליונים
4. **תיעוד API** - ✅ נוצר מסמך תיעוד מקיף

### ⚠️ הערות:
1. **חזרתיות** - יש חזרתיות ב-`fetchProducts()` ו-`fetchCategories()` - אפשר לשקול custom hooks בעתיד
2. **ProductCard** - משתמש ב-hooks/context ל-API calls - זה בסדר כי הם חלק מה-logic של הקומפוננטה

---

**תאריך יצירה**: 2024  
**עודכן לאחרונה**: 2024

