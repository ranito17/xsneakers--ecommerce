/**
 * כלי עזר למשתמשים והודעות - User & Message Utilities
 * 
 * פונקציות עיצוב ולידציה למשתמש/פרופיל/הודעות.
 * מטפל בתצוגת משתמש, סוגי הודעות, עדיפויות ולידציה של משתמש.
 */

// ============================================================================
// עיצוב תצוגת משתמש - USER DISPLAY FORMATTING
// ============================================================================

/**
 * מעיצב את השם המלא של המשתמש לתצוגה
 * 
 * @param {Object} user - אובייקט משתמש
 * @returns {string} שם מעוצב או 'User'
 */
export const formatUserName = (user) => {
    if (!user) return 'User';
    
    if (user.full_name) return user.full_name;
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0]; // Use email username as fallback
    
    return 'User';
};

/**
 * מעיצב כתובת לתצוגה
 * 
 * @param {Object|string} address - אובייקט כתובת עם house_number, street, city, zipcode או מחרוזת
 * @param {string} format - סוג עיצוב: 'full' (ברירת מחדל), 'short', או 'multiline'
 * @returns {string} כתובת מעוצבת או 'N/A'
 */
export const formatAddress = (address, format = 'full') => {
    if (!address) return 'N/A';
    
    // If address is a string, try to parse it as JSON first
    if (typeof address === 'string') {
        // Try to parse JSON string
        try {
            const parsed = JSON.parse(address);
            if (typeof parsed === 'object' && parsed !== null) {
                address = parsed;
                // Continue to process as object below
            } else {
                // Not a JSON object, treat as plain string
                if (format === 'short' && address.length > 40) {
                    return address.substring(0, 40) + '...';
                }
                return address;
            }
        } catch (e) {
            // Not valid JSON, treat as plain string
            if (format === 'short' && address.length > 40) {
                return address.substring(0, 40) + '...';
            }
            return address;
        }
    }
    
    // If address is an object, format it
    if (typeof address === 'object') {
        const { house_number, street, city, zipcode } = address;
        
        // Check if all required fields are present
        if (!house_number && !street && !city && !zipcode) {
            return 'N/A';
        }
        
        // Build address parts
        const parts = [];
        
        if (house_number && street) {
            parts.push(`${house_number} ${street}`);
        } else if (street) {
            parts.push(street);
        } else if (house_number) {
            parts.push(house_number);
        }
        
        if (city) parts.push(city);
        if (zipcode) parts.push(zipcode);
        
        if (parts.length === 0) return 'N/A';
        
        // Format based on type
        switch (format) {
            case 'short':
                // Show only first part and city (e.g., "123 Main St, New York")
                const shortParts = [];
                if (house_number && street) {
                    shortParts.push(`${house_number} ${street}`);
                } else if (street) {
                    shortParts.push(street);
                }
                if (city) shortParts.push(city);
                return shortParts.join(', ') || 'N/A';
                
            case 'multiline':
                // Return address with line breaks for display
                const line1 = house_number && street ? `${house_number} ${street}` : street || house_number || '';
                const line2 = [city, zipcode].filter(Boolean).join(', ');
                return [line1, line2].filter(Boolean).join('\n');
                
            case 'full':
            default:
                // Full address on one line
                return parts.join(', ');
        }
    }
    
    return 'N/A';
};

/**
 * Get user initials for avatar display
 * @param {Object} user - User object
 * @returns {string} User initials (1-2 characters)
 */
export const getUserInitials = (user) => {
    if (!user) return 'U';
    
    const name = formatUserName(user);
    
    // Split name into words
    const words = name.trim().split(/\s+/);
    
    if (words.length >= 2) {
        // First letter of first two words
        return (words[0][0] + words[1][0]).toUpperCase();
    } else {
        // First two letters of single word
        return name.substring(0, 2).toUpperCase();
    }
};

/**
 * Get human-readable user role label
 * @param {string} role - User role
 * @returns {string} Human-readable role
 */
export const getUserRoleLabel = (role) => {
    if (!role) return 'Customer';
    
    const roleLower = role.toLowerCase();
    
    const roleMap = {
        'admin': 'Administrator',
        'customer': 'Customer',
        'guest': 'Guest',
        'supplier': 'Supplier'
    };
    
    return roleMap[roleLower] || role;
};

/**
 * Get CSS class for user role badge
 * @param {string} role - User role
 * @returns {string} CSS class name
 */
export const getUserRoleBadgeClass = (role) => {
    if (!role) return 'customer';
    
    const roleLower = role.toLowerCase();
    
    const classMap = {
        'admin': 'admin',
        'customer': 'customer',
        'guest': 'guest',
        'supplier': 'supplier'
    };
    
    return classMap[roleLower] || 'customer';
};

// ============================================================================
// MESSAGE TYPE & PRIORITY FORMATTING
// ============================================================================

/**
 * Get message type label with emoji
 * @param {string} type - Message type
 * @returns {string} Formatted label with emoji
 */
export const getMessageTypeLabel = (type) => {
    if (!type) return type;
    
    const labels = {
        'customer_inquiry': '👤 Customer',
        'guest_inquiry': '👥 Guest',
        'admin_to_supplier': '📦 To Supplier',
        'admin_to_admin': '👨‍💼 Admin',
        'low_stock_alert': '⚠️ Low Stock'
    };
    
    return labels[type] || type;
};

/**
 * Get CSS class for message priority
 * @param {string} priority - Message priority
 * @returns {string} CSS class name
 */
export const getMessagePriorityClass = (priority) => {
    if (!priority) return 'normal';
    
    const priorityLower = priority.toLowerCase();
    
    const classMap = {
        'urgent': 'priorityUrgent',
        'high': 'priorityHigh',
        'normal': 'priorityNormal',
        'low': 'priorityLow'
    };
    
    return classMap[priorityLower] || 'priorityNormal';
};

/**
 * Get CSS class for message status
 * @param {string} status - Message status
 * @returns {string} CSS class name
 */
export const getMessageStatusClass = (status) => {
    if (!status) return 'new';
    
    const statusLower = status.toLowerCase();
    
    const classMap = {
        'new': 'statusNew',
        'read': 'statusRead',
        'resolved': 'statusResolved',
        'archived': 'statusArchived'
    };
    
    return classMap[statusLower] || 'statusNew';
};

/**
 * Get human-readable message priority label
 * @param {string} priority - Message priority
 * @returns {string} Human-readable priority
 */
export const getMessagePriorityLabel = (priority) => {
    if (!priority) return 'Normal';
    
    const priorityLower = priority.toLowerCase();
    
    const labelMap = {
        'urgent': 'Urgent',
        'high': 'High',
        'normal': 'Normal',
        'low': 'Low'
    };
    
    return labelMap[priorityLower] || priority;
};

// ============================================================================
// USER VALIDATION (from validators.js)
// ============================================================================

// Regex patterns for validation
const REGEX_PATTERNS = {
    NAME: /^[a-zA-Z0-9\s]+$/,
    EMAIL: /^[^\s@]+@gmail\.com$/,
    PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,  // At least 6 chars, must have letters AND numbers
    PHONE: /^\d{10}$/,
    HOUSE_NUMBER: /^[0-9]+$/,  // One or more numeric digits only
    STREET: /^[a-zA-Z0-9\s\-\'\.]+$/,
    CITY: /^[a-zA-Z\s\-\']{3,}$/,  // At least 3 letters
    ZIPCODE: /^\d{3,}$/  // At least 3 numeric digits
};

/**
 * Validate user name
 * @param {string} name - Name to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateName = (name) => {
    if (!name || !name.trim()) {
        return { isValid: false, message: 'Name is required' };
    }
    if (name.trim().length < 2) {
        return { isValid: false, message: 'Name must be at least 2 characters long' };
    }
    if (!REGEX_PATTERNS.NAME.test(name)) {
        return { isValid: false, message: 'Name can contain letters, numbers, and spaces only (no symbols)' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
    if (!email || !email.trim()) {
        return { isValid: false, message: 'Email is required' };
    }
    if (!REGEX_PATTERNS.EMAIL.test(email)) {
        return { isValid: false, message: 'Please enter a valid Gmail address (must end with @gmail.com)' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate phone number (optional - only validates format if provided)
 * @param {string} phone - Phone number to validate
 * @param {boolean} required - Whether phone is required (default: false)
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePhone = (phone, required = false) => {
    if (!phone || !phone.trim()) {
        if (required) {
            return { isValid: false, message: 'Phone number is required' };
        }
        return { isValid: true, message: '' }; // Optional field, empty is valid
    }
    if (!REGEX_PATTERNS.PHONE.test(phone.trim())) {
        return { isValid: false, message: 'Phone number must be exactly 10 digits' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate user role
 * @param {string} role - Role to validate
 * @returns {Object} { isValid: boolean, message: string }
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

// ============================================================================
// ADDRESS VALIDATION
// ============================================================================

/**
 * Validate house number
 * @param {string} houseNumber - House number to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateHouseNumber = (houseNumber) => {
    if (!houseNumber || !houseNumber.trim()) {
        return { isValid: false, message: 'House number is required' };
    }
    if (!REGEX_PATTERNS.HOUSE_NUMBER.test(houseNumber.trim())) {
        return { isValid: false, message: 'Invalid house number format (e.g., 123 or 123A)' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate street name
 * @param {string} street - Street name to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateStreet = (street) => {
    if (!street || !street.trim()) {
        return { isValid: false, message: 'Street name is required' };
    }
    if (street.trim().length < 1) {
        return { isValid: false, message: 'Street name must be at least 1 characters long' };
    }
    if (!REGEX_PATTERNS.STREET.test(street.trim())) {
        return { isValid: false, message: 'Invalid street name (letters, numbers, spaces, hyphens allowed)' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate city name
 * @param {string} city - City name to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateCity = (city) => {
    if (!city || !city.trim()) {
        return { isValid: false, message: 'City name is required' };
    }
    if (city.trim().length < 2) {
        return { isValid: false, message: 'City name must be greater than 2 characters long' };
    }
    if (!REGEX_PATTERNS.CITY.test(city.trim())) {
        return { isValid: false, message: 'Invalid city name (only letters, spaces, and hyphens allowed)' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate zipcode
 * @param {string} zipcode - Zipcode to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateZipcode = (zipcode) => {
    if (!zipcode || !zipcode.trim()) {
        return { isValid: false, message: 'Zipcode is required' };
    }
    if (!REGEX_PATTERNS.ZIPCODE.test(zipcode.trim())) {
        return { isValid: false, message: 'Invalid zipcode (must be at least 3 digits)' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate complete address object
 * @param {Object} address - Address object with house_number, street, city, zipcode
 * @param {boolean} required - Whether address is required (default: true for orders)
 * @returns {Object} { isValid: boolean, errors: object }
 */
export const validateAddress = (address, required = true) => {
    const errors = {};
    
    // Check if address is empty
    const isEmpty = !address || (!address.house_number && !address.street && !address.city && !address.zipcode);
    
    if (isEmpty && required) {
        return {
            isValid: false,
            errors: { general: 'Address is required' }
        };
    }
    
    if (isEmpty && !required) {
        return {
            isValid: true,
            errors: {}
        };
    }
    
    // If any field is provided, all fields are required
    const hasAnyField = address.house_number || address.street || address.city || address.zipcode;
    
    if (hasAnyField) {
        const houseNumberValidation = validateHouseNumber(address.house_number);
        if (!houseNumberValidation.isValid) {
            errors.house_number = houseNumberValidation.message;
        }
        
        const streetValidation = validateStreet(address.street);
        if (!streetValidation.isValid) {
            errors.street = streetValidation.message;
        }
        
        const cityValidation = validateCity(address.city);
        if (!cityValidation.isValid) {
            errors.city = cityValidation.message;
        }
        
        const zipcodeValidation = validateZipcode(address.zipcode);
        if (!zipcodeValidation.isValid) {
            errors.zipcode = zipcodeValidation.message;
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ============================================================================
// PROFILE VALIDATION
// ============================================================================

/**
 * Validate profile update data
 * @param {Object} profileData - Profile data to validate
 * @returns {Object} { isValid: boolean, errors: object }
 */
export const validateProfileUpdate = (profileData) => {
    const errors = {};
    
    if (profileData.full_name !== undefined) {
        const nameValidation = validateName(profileData.full_name);
        if (!nameValidation.isValid) {
            errors.full_name = nameValidation.message;
        }
    }
    
    // Phone is optional in profile - only validate format if provided
    if (profileData.phone_number !== undefined && profileData.phone_number && profileData.phone_number.trim()) {
        const phoneValidation = validatePhone(profileData.phone_number, false);
        if (!phoneValidation.isValid) {
            errors.phone_number = phoneValidation.message;
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate password change
 * @param {Object} passwordData - Object with currentPassword, newPassword, confirmPassword
 * @returns {Object} { isValid: boolean, errors: object }
 */
export const validatePasswordChange = (passwordData) => {
    const errors = {};
    
    if (!passwordData.currentPassword || !passwordData.currentPassword.trim()) {
        errors.currentPassword = 'Current password is required';
    }
    
    // Validate new password
    if (!passwordData.newPassword) {
        errors.newPassword = 'New password is required';
    } else if (!REGEX_PATTERNS.PASSWORD.test(passwordData.newPassword)) {
        errors.newPassword = 'Password must be at least 4 characters long';
    }
    
    // Validate confirm password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }
    
    // Check that new password is different from current
    if (passwordData.currentPassword === passwordData.newPassword) {
        errors.newPassword = 'New password must be different from current password';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

