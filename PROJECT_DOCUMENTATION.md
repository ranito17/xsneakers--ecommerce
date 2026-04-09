# תיעוד מלא של הפרויקט - Complete Project Documentation

מסמך מקיף זה מסביר את כל המערכת: Backend, Frontend, ואיך הם מתחברים.

---

## תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [ארכיטקטורה כללית](#ארכיטקטורה-כללית)
3. [Backend - סקירה](#backend---סקירה)
4. [Frontend - סקירה](#frontend---סקירה)
5. [חיבור Backend ו-Frontend](#חיבור-backend-ו-frontend)
6. [זרימת נתונים](#זרימת-נתונים)
7. [אימות והרשאות](#אימות-והרשאות)
8. [מסד נתונים](#מסד-נתונים)

---

## סקירה כללית

זהו פרויקט מלא של מערכת ניהול חנות נעליים (E-commerce) המבוסס על:
- **Backend**: Node.js + Express + MySQL
- **Frontend**: React + React Router

המערכת מספקת:
- ניהול משתמשים והרשאות (לקוחות ואדמינים)
- ניהול מוצרים וקטגוריות
- עגלת קניות והזמנות
- תשלומי PayPal
- מערכת הודעות
- אנליטיקס ודוחות
- מעקב פעילות מנהלים

---

## ארכיטקטורה כללית

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │   Services   │      │
│  │              │  │              │  │   (API)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP Requests
                             │ (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │ Controllers  │  │   Models     │      │
│  │              │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │ SQL Queries
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    MySQL Database                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   users      │  │  products    │  │   orders     │      │
│  │   carts      │  │  categories  │  │   messages   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend - סקירה

### מבנה הקבצים

```
backend/src/
├── app.js                    # קובץ האפליקציה הראשי
├── config/                   # הגדרות
│   ├── config.js            # הגדרות כלליות
│   └── database.js          # חיבור למסד נתונים
├── controllers/              # בקרים - לוגיקת עסקים
├── models/                   # מודלים - פעולות מסד נתונים
├── routes/                   # נתיבים - API endpoints
├── services/                 # שירותים חיצוניים
│   ├── emailService.js      # שליחת אימיילים
│   └── paypalService.js     # אינטגרציה עם PayPal
├── middleware/               # Middleware
│   ├── auth.js              # אימות JWT
│   ├── adminAuth.js         # בדיקת הרשאות אדמין
│   ├── activityLogger.js    # רישום פעילות
│   ├── error.js             # טיפול בשגיאות
│   ├── logger.js            # רישום בקשות
│   └── upload.js            # ניהול העלאת קבצים
└── uploads/                  # תיקיית העלאת קבצים
```

### מודלים (Models)

כל מודל מנהל את הפעולות הקשורות לטבלה מסוימת במסד הנתונים:

#### User.js
- ניהול משתמשים: יצירה, עדכון, מחיקה
- אימות: התחברות, איפוס סיסמה
- פרופיל: עדכון פרטים, כתובת, סיסמה
- Wishlist: הוספה, הסרה, קבלה

#### Product.js
- ניהול מוצרים: CRUD מלא
- מלאי: ניהול גדלים וכמויות
- סטטיסטיקות: מוצרים נמכרים, מלאי נמוך
- **חשוב**: `decreaseStockForSize()` - מפחית מלאי בעת הזמנה
- **חשוב**: `increaseStockForSize()` - מחזיר מלאי בעת ביטול הזמנה

#### Order.js
- יצירת הזמנות: `placeOrder()` - בודק מלאי, יוצר הזמנה, מפחית מלאי
- עדכון סטטוס: `updateOrderStatus()` - **מחזיר מלאי אם מבטלים הזמנה**
- סטטיסטיקות: דשבורד, אנליטיקס, best sellers
- **חשוב**: כאשר סטטוס משתנה ל-"cancelled", המלאי מוחזר אוטומטית

#### Category.js
- ניהול קטגוריות: CRUD מלא
- תמונות: העלאה ומחיקה

#### Cart.js
- עגלת קניות: הוספה, עדכון, הסרה, ניקוי
- חישוב סה"כ

#### Settings.js
- הגדרות מערכת: key-value pairs
- הגדרות ציבוריות ופרטיות

#### Message.js
- הודעות קשר: יצירה, עדכון סטטוס, מחיקה

#### Activity.js
- מעקב פעילות: רישום פעולות מנהלים

### בקרים (Controllers)

כל בקר מקבל בקשות HTTP, מטפל בהן, קורא למודל המתאים, ומחזיר תגובה.

**דוגמה - userController.js**:
- `login()` - התחברות, יצירת JWT, שמירה ב-cookie
- `getProfile()` - קבלת פרופיל משתמש
- `updateProfile()` - עדכון פרופיל
- ועוד...

### נתיבים (Routes)

כל route מגדיר endpoint ספציפי ומחבר אותו ל-controller המתאים.

**דוגמה - userRoutes.js**:
```javascript
POST /api/userRoutes/login          → userController.login
GET  /api/userRoutes/profile        → userController.getProfile
PUT  /api/userRoutes/profile        → userController.updateProfile
```

### Middleware

- **auth.js**: אימות JWT - בודק token ב-cookie
- **adminAuth.js**: בדיקת הרשאות אדמין
- **activityLogger.js**: רישום פעולות מנהלים
- **error.js**: טיפול בשגיאות אחיד
- **logger.js**: רישום בקשות

### שירותים (Services)

- **emailService.js**: שליחת אימיילים (SendGrid)
  - אימייל ברכה למשתמש חדש
  - אימייל איפוס סיסמה
  - אימייל בקשת מלאי לספק
  - אימייל אישור הזמנה

- **paypalService.js**: אינטגרציה עם PayPal
  - `createOrder()` - יוצר הזמנת PayPal
  - `captureOrder()` - מבצע תשלום PayPal
  - **תיקונים שבוצעו**: עיגול סכום ל-2 ספרות עשרוניות, שיפור טיפול בשגיאות

---

## Frontend - סקירה

### מבנה הקבצים

```
frontend/src/
├── components/          # קומפוננטות לשימוש חוזר
│   ├── admin/         # קומפוננטות אדמין
│   ├── auth/          # קומפוננטות אימות
│   ├── cart/          # קומפוננטות עגלה
│   ├── common/        # קומפוננטות משותפות
│   ├── layout/        # קומפוננטות פריסה
│   ├── orders/        # קומפוננטות הזמנות
│   ├── payment/       # קומפוננטות תשלום
│   ├── products/      # קומפוננטות מוצרים
│   └── wishlist/      # קומפוננטות wishlist
├── pages/              # דפי האפליקציה
│   ├── adminPages/    # דפי אדמין
│   └── [other pages]  # דפים נוספים
├── services/           # שירותי API
├── utils/              # פונקציות עזר
├── context/            # React Contexts
├── hooks/              # Custom Hooks
└── layout/             # פריסות
```

### עקרונות עיצוב

#### 1. API Calls בדפים העליונים
**כלל זהב**: קריאות API צריכות להיות בדפים (`pages/`), לא בקומפוננטות.

**יוצאים מן הכלל** (קומפוננטות שמותר להן לעשות API calls):
- `PayPalModal` - modal תשלום מיוחד
- `StockRefuelModal` - modal מיוחד למילוי מלאי
- `Footer` - layout component שצריך לטעון נתונים
- `ContactForm` - form component שצריך לשלוח הודעות

#### 2. Services Layer
כל קריאות API עוברות דרך שירותי API ב-`services/`:
- `productApi.js` - מוצרים וקטגוריות
- `orderApi.js` - הזמנות
- `userApi.js` - משתמשים
- `cartApi.js` - עגלת קניות
- `authApi.js` - אימות
- `paymentApi.js` - תשלומים
- ועוד...

#### 3. פורמט ולולידציה
- **פורמט**: פונקציות כלליות → `utils/`, פורמט ספציפי → בדף העליון
- **ולידציה**: בדף העליון או ב-`utils/`

### דפים (Pages)

#### דפי לקוח:
- `HomePage.jsx` - דף הבית (מוצרים, קטגוריות, best sellers)
- `ProductsPage.jsx` - רשימת מוצרים עם סינון
- `CartPage.jsx` - עגלת קניות
- `PaymentPage.jsx` - תשלום והזמנה
- `OrderPage.jsx` - היסטוריית הזמנות
- `ProfilePage.jsx` - פרופיל משתמש
- `WishlistPage.jsx` - רשימת משאלות

#### דפי אדמין:
- `DashboardPage.jsx` - דשבורד עם סטטיסטיקות
- `ProductManagment.jsx` - ניהול מוצרים
- `OrderManagmentPage.jsx` - ניהול הזמנות
- `UserManagmentPage.jsx` - ניהול משתמשים
- `CategoryManagementPage.jsx` - ניהול קטגוריות
- `MessagesPage.jsx` - ניהול הודעות
- `AnalyticsPage.jsx` - אנליטיקס
- `SettingsPage.jsx` - הגדרות מערכת
- `ActivityPageAdmin.jsx` - מעקב פעילות

### Contexts ו-Hooks

#### Contexts:
- `AuthProvider` - מצב אימות גלובלי
- `CartProvider` - מצב עגלת קניות גלובלי
- `SettingsProvider` - הגדרות גלובליות

#### Hooks:
- `useAuthentication` - Hook לאימות
- `useCart` - Hook לעגלת קניות
- `useAuthorization` - Hook להרשאות

### פונקציות עזר (Utils)

- `price.utils.js` - פורמט מחירים, חישובי מס, משלוח
- `user.utils.js` - פורמט משתמשים, ולידציה
- `product.utils.js` - פורמט מוצרים, סינון
- `order.utils.js` - פורמט הזמנות, סינון
- `date.utils.js` - פורמט תאריכים

---

## חיבור Backend ו-Frontend

### Base URL

Frontend מתחבר ל-Backend דרך:
```javascript
// frontend/src/services/api.js
const API_BASE_URL = 'http://localhost:3001';
```

### Authentication

**Backend**:
- משתמש ב-JWT tokens
- Token נשמר ב-HTTP-only cookie
- Middleware `auth.js` בודק token בכל בקשה מאומתת

**Frontend**:
- שולח cookies אוטומטית עם כל בקשה (credentials: 'include')
- `AuthProvider` בודק אימות בעת טעינת האפליקציה
- `useAuth` hook מספק פונקציות login/logout

**זרימה**:
1. משתמש מתחבר → `POST /api/userRoutes/login`
2. Backend יוצר JWT ושומר ב-cookie
3. Frontend מקבל תגובה עם פרטי משתמש
4. כל בקשה מאומתת שולחת cookie אוטומטית
5. Backend בודק token ב-middleware `auth.js`

### API Endpoints

כל endpoint ב-Backend מחובר ל-component/דף ב-Frontend:

#### דוגמאות:

**1. התחברות**:
- **Backend**: `POST /api/userRoutes/login` → `userController.login`
- **Frontend**: `LoginForm.jsx` → `authApi.login()`

**2. קבלת מוצרים**:
- **Backend**: `GET /api/productRoutes/` → `productController.getProducts`
- **Frontend**: `ProductsPage.jsx` → `productApi.getProducts()`

**3. יצירת הזמנה**:
- **Backend**: `POST /api/orderRoutes/place` → `orderController.placeOrder`
- **Frontend**: `PaymentPage.jsx` → `orderApi.placeOrder()`

**4. עדכון סטטוס הזמנה**:
- **Backend**: `PATCH /api/orderRoutes/:id/status` → `orderController.updateOrderStatus`
- **Frontend**: `OrderManagmentPage.jsx` → `orderApi.updateOrderStatus()`
- **חשוב**: Backend מחזיר מלאי אוטומטית אם הסטטוס הוא "cancelled"

### Request/Response Format

**Request**:
```javascript
// Frontend
const response = await productApi.getProducts();
```

**Backend Response**:
```javascript
{
    success: true,
    data: [...products]
}
```

**Error Response**:
```javascript
{
    success: false,
    message: "Error message"
}
```

---

## זרימת נתונים

### דוגמה: יצירת הזמנה

```
1. משתמש לוחץ "שלם" ב-PaymentPage.jsx
   ↓
2. PaymentPage.jsx קורא ל-orderApi.placeOrder(orderData)
   ↓
3. orderApi.js שולח POST /api/orderRoutes/place
   ↓
4. Backend: orderRoutes.js → orderController.placeOrder()
   ↓
5. orderController.placeOrder() קורא ל-Order.placeOrder()
   ↓
6. Order.placeOrder() בודק מלאי, יוצר הזמנה, מפחית מלאי
   ↓
7. Backend מחזיר { success: true, orderId, orderNumber }
   ↓
8. Frontend מקבל תגובה ומעדכן UI
```

### דוגמה: עדכון סטטוס הזמנה

```
1. אדמין משנה סטטוס ב-OrderManagmentPage.jsx
   ↓
2. OrderManagmentPage.jsx קורא ל-orderApi.updateOrderStatus(orderId, status)
   ↓
3. orderApi.js שולח PATCH /api/orderRoutes/:id/status
   ↓
4. Backend: orderRoutes.js → orderController.updateOrderStatus()
   ↓
5. orderController.updateOrderStatus() קורא ל-Order.updateOrderStatus()
   ↓
6. Order.updateOrderStatus() בודק אם הסטטוס הוא "cancelled"
   ↓
7. אם כן, קורא ל-Product.increaseStockForSize() לכל פריט
   ↓
8. Backend מחזיר { success: true, message: "Order status updated" }
   ↓
9. Frontend מקבל תגובה ומעדכן UI
```

---

## אימות והרשאות

### רמות הרשאה

1. **ציבורי** - כל אחד יכול לגשת
   - דוגמאות: `GET /api/productRoutes/`, `GET /api/orderRoutes/analytics/best-sellers`

2. **מאומת** - דורש התחברות
   - Middleware: `isAuthenticated`
   - דוגמאות: `GET /api/userRoutes/profile`, `POST /api/orderRoutes/place`

3. **אדמין** - דורש התחברות + הרשאות אדמין
   - Middleware: `isAuthenticated` + `adminAuth`
   - דוגמאות: `GET /api/userRoutes/all`, `DELETE /api/productRoutes/:id`

### Frontend Protection

- `ProtectedRoute` - מגן על דפים שדורשים אימות
- `useAuthorization` - Hook לבדיקת הרשאות
- `AdminLayout` - פריסה לדפי אדמין

---

## מסד נתונים

### טבלאות עיקריות

- **users** - משתמשים (לקוחות ואדמינים)
- **products** - מוצרים
- **categories** - קטגוריות
- **orders** - הזמנות
- **order_items** - פריטי הזמנה
- **carts** - עגלות קניות
- **cart_items** - פריטי עגלה
- **contact_messages** - הודעות קשר
- **settings** - הגדרות (key-value)
- **activities** - פעילויות מנהלים

### קשרים (Foreign Keys)

- `products.category_id` → `categories.category_id`
- `orders.user_id` → `users.id`
- `order_items.order_id` → `orders.order_id`
- `order_items.product_id` → `products.id`
- `cart_items.cart_id` → `carts.cart_id`
- `cart_items.product_id` → `products.id`
- `carts.user_id` → `users.id`

### תכונות חשובות

#### 1. ניהול מלאי
- `products.sizes` - JSON array של `{size: string, quantity: number}`
- `products.stock_quantity` - סך המלאי (מחושב מ-sizes)
- בעת הזמנה: `Product.decreaseStockForSize()` מפחית מלאי
- בעת ביטול: `Product.increaseStockForSize()` מחזיר מלאי

#### 2. כתובות
- `users.address` - JSON: `{house_number, street, city, zipcode}`
- `orders.address` - JSON: `{house_number, street, city, zipcode}`

#### 3. תמונות
- `products.image_urls` - מחרוזת מופרדת בפסיקים או JSON array
- `categories.image_urls` - JSON array

---

## סיכום

### Backend
- Node.js + Express + MySQL
- ארכיטקטורה: Routes → Controllers → Models → Database
- אימות: JWT tokens ב-HTTP-only cookies
- Middleware: auth, adminAuth, activityLogger, error, logger
- שירותים: emailService (SendGrid), paypalService

### Frontend
- React + React Router
- ארכיטקטורה: Pages → Components → Services → API
- API Calls: בדפים העליונים (עם יוצאים מן הכלל)
- Contexts: AuthProvider, CartProvider, SettingsProvider
- Utils: פורמט ולולידציה

### חיבור
- HTTP requests (JSON)
- Base URL: `http://localhost:3001`
- Authentication: JWT ב-cookies
- Response format: `{ success: boolean, data?: any, message?: string }`

### תכונות מיוחדות
- **החזרת מלאי**: כאשר הזמנה מבוטלת, המלאי מוחזר אוטומטית
- **PayPal**: אינטגרציה מלאה עם PayPal לתשלומים
- **אנליטיקס**: דוחות מקיפים למנהלים
- **מעקב פעילות**: רישום כל פעולות המנהלים

---

**תאריך יצירה**: 2024  
**עודכן לאחרונה**: 2024

