// frontend/src/utils/validators.js

// קובץ אימות נתונים - מכיל פונקציות אימות לכל הטופסים באפליקציה
// כולל הרשמה, התחברות וטופסי מוצרים

// תבניות Regex לאימות נתונים
export const REGEX_PATTERNS = {
    NAME: /^[a-zA-Z0-9\s]+$/,      // אותיות, מספרים ורווחים (ללא סמלים)
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // תבנית אימייל תקינה
    PASSWORD: /^.{4,}$/,           // לפחות 4 תווים, כל דבר
    PHONE: /^\d{10}$/              // בדיוק 10 ספרות
};

/**
 * פונקציה לאימות שם משתמש
 * @param {string} name - השם לאימות
 * @returns {Object} אובייקט עם תוצאת האימות והודעה
 */
export const validateName = (name) => {
    if (!name) {
        return { isValid: false, message: 'Name is required' };
    }
    if (!REGEX_PATTERNS.NAME.test(name)) {
        return { isValid: false, message: 'Name can contain letters, numbers, and spaces only (no symbols)' };
    }
    if (name.length < 4) {
        return { isValid: false, message: 'Name must be at least 4 characters long' };
    }
    return { isValid: true, message: '' };
};

/**
 * פונקציה לאימות כתובת אימייל
 * @param {string} email - האימייל לאימות
 * @returns {Object} אובייקט עם תוצאת האימות והודעה
 */
export const validateEmail = (email) => {
    if (!email) {
        return { isValid: false, message: 'Email is required' };
    }
    if (!REGEX_PATTERNS.EMAIL.test(email)) {
        return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true, message: '' };
};

/**
 * פונקציה לאימות טופס התחברות (מינימלי)
 * @param {Object} formData - נתוני הטופס
 * @returns {Object} אובייקט עם תוצאת האימות ושגיאות
 */
export const validateLoginForm = (formData) => {
    const errors = {};
    
    // רק בדיקה שהשדות לא ריקים - אין בדיקות נוספות
    if (!formData.email || !formData.email.trim()) {
        errors.email = 'Email is required';
    }
    
    if (!formData.password || !formData.password.trim()) {
        errors.password = 'Password is required';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
};

/**
 * פונקציה לאימות סיסמה
 * @param {string} password - הסיסמה לאימות
 * @returns {Object} אובייקט עם תוצאת האימות והודעה
 */
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }
    if (!REGEX_PATTERNS.PASSWORD.test(password)) {
        return { 
            isValid: false, 
            message: 'Password must be at least 4 characters long' 
        };
    }
    return { isValid: true, message: '' };
};

/**
 * פונקציה לאימות אימות סיסמה
 * @param {string} password - הסיסמה המקורית
 * @param {string} confirmPassword - אימות הסיסמה
 * @returns {Object} אובייקט עם תוצאת האימות והודעה
 */
export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
        return { isValid: false, message: 'Please confirm your password' };
    }
    if (password !== confirmPassword) {
        return { isValid: false, message: 'Passwords do not match' };
    }
    return { isValid: true, message: '' };
};

/**
 * פונקציה לאימות מספר טלפון
 * @param {string} phone - מספר הטלפון לאימות
 * @returns {Object} אובייקט עם תוצאת האימות והודעה
 */
export const validatePhone = (phone) => {
    if (!phone) {
        return { isValid: false, message: 'Phone number is required' };
    }
    if (!REGEX_PATTERNS.PHONE.test(phone)) {
        return { isValid: false, message: 'Phone number must be exactly 10 digits' };
    }
    return { isValid: true, message: '' };
};

/**
 * פונקציה לאימות טופס הרשמה מלא
 * @param {Object} formData - נתוני הטופס
 * @returns {Object} אובייקט עם תוצאת האימות ושגיאות
 */
export const validateSignupForm = (formData) => {
    const errors = {};
    
    // אימות שם מלא
    const nameValidation = validateName(formData.full_name);
    if (!nameValidation.isValid) {
        errors.full_name = nameValidation.message;
    }
    
    // אימות אימייל
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
        errors.email = emailValidation.message;
    }
    
    // אימות סיסמה
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
    }
    
    // אימות אימות סיסמה
    const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (!confirmPasswordValidation.isValid) {
        errors.confirmPassword = confirmPasswordValidation.message;
    }
    
    // אימות כתובת (אופציונלי כרגע)
    if (formData.address && formData.address.trim().length < 5) {
        errors.address = 'Address must be at least 5 characters long';
    }
    
    // אימות מספר טלפון
    const phoneValidation = validatePhone(formData.phone_number);
    if (!phoneValidation.isValid) {
        errors.phone_number = phoneValidation.message;
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
};



/**
 * פונקציה לאימות שדה בודד בזמן אמת
 * @param {string} fieldName - שם השדה לאימות
 * @param {string} value - הערך לאימות
 * @param {Object} formData - נתוני הטופס המלא (לצורך אימות תלוי הקשר)
 * @returns {Object} אובייקט עם תוצאת האימות והודעה
 */
export const validateField = (fieldName, value, formData = {}) => {
    switch (fieldName) {
        case 'name':
            return validateName(value);
        case 'email':
            return validateEmail(value);
        case 'password':
            return validatePassword(value);
        case 'confirmPassword':
            return validateConfirmPassword(formData.password, value);
        default:
            return { isValid: true, message: '' };
    }
};

/**
 * פונקציה לאימות טופס מוצר
 * @param {Object} formData - נתוני המוצר
 * @param {Array} categories - רשימת הקטגוריות הזמינות
 * @returns {Object} אובייקט עם תוצאת האימות ושגיאות
 */
export const validateProductForm = (formData, categories = []) => {
    const errors = {};
    
    // אימות שם המוצר
    if (!formData.name || !formData.name.trim()) {
        errors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2) {
        errors.name = 'Product name must be at least 2 characters long';
    } else if (formData.name.trim().length > 100) {
        errors.name = 'Product name must be less than 100 characters';
    }
    
    // אימות מחיר המוצר
    if (!formData.price || formData.price === '') {
        errors.price = 'Price is required';
    } else {
        const price = parseFloat(formData.price);
        if (isNaN(price)) {
            errors.price = 'Price must be a valid number';
        } else if (price <= 0) {
            errors.price = 'Price must be greater than 0';
        } else if (price > 999999.99) {
            errors.price = 'Price must be less than $1,000,000';
        }
    }
    
    // אימות תיאור המוצר (אופציונלי)
    if (formData.description && formData.description.trim().length > 500) {
        errors.description = 'Product description must be less than 500 characters';
    }
    
    // אימות כמות מלאי - רק חיובי
    if (formData.stock_quantity !== undefined && formData.stock_quantity !== '') {
        const stock = parseInt(formData.stock_quantity);
        if (isNaN(stock)) {
            errors.stock_quantity = 'Stock quantity must be a valid number';
        } else if (stock < 0) {
            errors.stock_quantity = 'Stock quantity cannot be negative';
        }
    }
    
    // אימות URL תמונה (אופציונלי)
    if (formData.image_url && formData.image_url.trim()) {
        try {
            new URL(formData.image_url);
        } catch {
            errors.image_url = 'Please enter a valid image URL';
        }
    }
    
    // אימות צבע
    if (formData.color && formData.color.trim()) {
        if (formData.color.trim().length > 50) {
            errors.color = 'Color must be less than 50 characters';
        }
        // Check if color contains only letters, spaces, and common color characters
        const colorRegex = /^[a-zA-Z\s\-\(\)]+$/;
        if (!colorRegex.test(formData.color.trim())) {
            errors.color = 'Color can only contain letters, spaces, hyphens, and parentheses';
        }
    }
    
    // אימות גדלים
    if (formData.sizes && formData.sizes.trim()) {
        const sizesString = formData.sizes.trim();
        const sizesArray = sizesString.split(',').map(size => size.trim()).filter(size => size !== '');
        
        if (sizesArray.length === 0) {
            errors.sizes = 'Please enter at least one valid size';
        } else {
            // Check if all sizes are valid numbers
            for (let i = 0; i < sizesArray.length; i++) {
                const size = sizesArray[i];
                const sizeNumber = parseFloat(size);
                
                if (isNaN(sizeNumber)) {
                    errors.sizes = `Size "${size}" is not a valid number`;
                    break;
                }
                
                if (sizeNumber <= 0) {
                    errors.sizes = `Size "${size}" must be greater than 0`;
                    break;
                }
                
                if (sizeNumber > 999) {
                    errors.sizes = `Size "${size}" must be less than 1000`;
                    break;
                }
                
                // Check for duplicate sizes
                if (sizesArray.indexOf(size) !== i) {
                    errors.sizes = `Duplicate size "${size}" found`;
                    break;
                }
            }
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
};

/**
 * פונקציה לאימות טופס קטגוריה
 * @param {Object} formData - נתוני הקטגוריה
 * @returns {Object} אובייקט עם תוצאת האימות ושגיאות
 */
export const validateCategoryForm = (formData) => {
    const errors = {};
    
    // אימות שם הקטגוריה
    if (!formData.category_name || !formData.category_name.trim()) {
        errors.category_name = 'Category name is required';
    } else if (formData.category_name.trim().length < 2) {
        errors.category_name = 'Category name must be at least 2 characters long';
    } else if (formData.category_name.trim().length > 50) {
        errors.category_name = 'Category name must be less than 50 characters';
    }
    
    // אימות תיאור הקטגוריה (אופציונלי)
    if (formData.description && formData.description.trim().length > 200) {
        errors.description = 'Description must be less than 200 characters';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
};

/**
 * פונקציה לאימות תפקיד משתמש
 * @param {string} role - התפקיד לאימות
 * @returns {Object} אובייקט עם תוצאת האימות והודעה
 */
export const validateRole = (role) => {
    const validRoles = ['customer', 'admin'];
    
    if (!role) {
        return { isValid: false, message: 'Role is required' };
    }
    
    if (!validRoles.includes(role)) {
        return { isValid: false, message: 'Role must be either customer or admin' };
    }
    
    return { isValid: true, message: '' };
};




