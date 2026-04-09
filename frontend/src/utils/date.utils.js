/**
 * Date Utilities
 * 
 * All date and time formatting functions.
 * Consolidates date operations that were duplicated across 10+ components.
 */

// ============================================================================
// BASIC DATE FORMATTING
// ============================================================================

/**
 * Format date string with various format options
 * @param {string|Date} dateString - Date to format
 * @param {string} format - Format type: 'short' | 'long' | 'numeric' | 'chart'
 * @returns {string} Formatted date or 'N/A' if invalid
 */
export const formatDate = (dateString, format = 'short') => {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        
        switch (format) {
            case 'short':
                // Example: "Jan 15, 2024"
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
            case 'long':
                // Example: "January 15, 2024"
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
            case 'numeric':
                // Example: "01/15/2024"
                return date.toLocaleDateString('en-US');
                
            case 'chart':
                // Example: "Jan 15" (for chart labels)
                return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
                
            default:
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
        }
    } catch (error) {
        console.error('Error formatting date:', dateString, error);
        return 'N/A';
    }
};

/**
 * Format date and time together
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date and time (e.g., "Jan 15, 2024 at 3:30 PM")
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        
        const datePart = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const timePart = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        return `${datePart} at ${timePart}`;
    } catch (error) {
        console.error('Error formatting datetime:', dateString, error);
        return 'N/A';
    }
};

/**
 * Format time only
 * @param {string|Date} dateString - Date to extract time from
 * @returns {string} Formatted time (e.g., "3:30 PM")
 */
export const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting time:', dateString, error);
        return 'N/A';
    }
};

// ============================================================================
// RELATIVE TIME FORMATTING
// ============================================================================

/**
 * Format date as relative time (e.g., "2h ago", "Just now")
 * Used in message inboxes and notifications
 * @param {string|Date} dateString - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        
        if (isNaN(date.getTime())) {
            return 'Unknown';
        }
        
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        // Fall back to short date format for older dates
        return formatDate(date, 'short');
    } catch (error) {
        console.error('Error formatting relative time:', dateString, error);
        return 'Unknown';
    }
};

/**
 * Get time difference between two dates
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {Object} { days, hours, minutes, seconds }
 */
export const getTimeDifference = (date1, date2) => {
    try {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        
        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        
        const diffMs = Math.abs(d2 - d1);
        
        return {
            days: Math.floor(diffMs / 86400000),
            hours: Math.floor((diffMs % 86400000) / 3600000),
            minutes: Math.floor((diffMs % 3600000) / 60000),
            seconds: Math.floor((diffMs % 60000) / 1000)
        };
    } catch (error) {
        console.error('Error calculating time difference:', error);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
};

// ============================================================================
// DATE CALCULATIONS & UTILITIES
// ============================================================================

/**
 * Add days to a date
 * @param {string|Date} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date object
 */
export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Subtract days from a date
 * @param {string|Date} date - Starting date
 * @param {number} days - Number of days to subtract
 * @returns {Date} New date object
 */
export const subtractDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

/**
 * Get default start date (N days ago)
 * @param {number} daysAgo - Number of days to go back (default: 30)
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export const getDefaultStartDate = (daysAgo = 30) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

/**
 * Get default end date (today)
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export const getDefaultEndDate = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Calculate date range based on number of months
 * Used in analytics date range picker
 * @param {number} months - Number of months to go back
 * @returns {Object} { startDate, endDate } in YYYY-MM-DD format
 */
export const calculateDateRange = (months) => {
    const end = new Date();
    const start = new Date();
    
    // Subtract months from current date
    start.setMonth(start.getMonth() - months);
    
    return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
    };
};

/**
 * Calculate estimated delivery date
 * @param {string|Date} orderDate - Order creation date
 * @param {number} deliveryDays - Number of days for delivery (default: 7)
 * @returns {string} Formatted estimated delivery date
 */
export const calculateEstimatedDelivery = (orderDate, deliveryDays = 7) => {
    try {
        const order = new Date(orderDate);
        const delivery = addDays(order, deliveryDays);
        return formatDate(delivery, 'long');
    } catch (error) {
        console.error('Error calculating delivery date:', error);
        return 'Unknown';
    }
};

// ============================================================================
// CHART-SPECIFIC DATE FORMATTING
// ============================================================================

/**
 * Format date for chart labels based on grouping
 * @param {string} dateString - Date to format
 * @param {string} groupBy - Grouping type: 'day' | 'week' | 'month' | 'year'
 * @returns {string} Formatted date for chart label
 */
export const formatChartDate = (dateString, groupBy = 'day') => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return dateString; // Return original if invalid
        }
        
        switch (groupBy) {
            case 'day':
                // "Jan 15"
                return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
                
            case 'week':
                // "Week of Jan 15"
                return `Week of ${date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                })}`;
                
            case 'month':
                // "Jan 2024"
                return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                });
                
            case 'year':
                // "2024"
                return date.toLocaleDateString('en-US', { 
                    year: 'numeric' 
                });
                
            default:
                return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
        }
    } catch (error) {
        console.error('Error formatting chart date:', dateString, error);
        return dateString;
    }
};

// ============================================================================
// DATE VALIDATION
// ============================================================================

/**
 * Check if a date string is valid
 * @param {string|Date} dateString - Date to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (dateString) => {
    if (!dateString) return false;
    
    try {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    } catch (error) {
        return false;
    }
};

/**
 * Check if date is in the past
 * @param {string|Date} dateString - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isDateInPast = (dateString) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        return date < now;
    } catch (error) {
        return false;
    }
};

/**
 * Check if date is in the future
 * @param {string|Date} dateString - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isDateInFuture = (dateString) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        return date > now;
    } catch (error) {
        return false;
    }
};

/**
 * Validate date range (start date must be before or equal to end date)
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateDateRange = (startDate, endDate) => {
    // If both are empty, it's valid (no range selected)
    if (!startDate && !endDate) {
        return { isValid: true, error: '' };
    }
    
    // If only one is provided, check if it's valid
    if (!startDate && endDate) {
        if (!isValidDate(endDate)) {
            return { isValid: false, error: 'End date is invalid' };
        }
        return { isValid: true, error: '' };
    }
    
    if (startDate && !endDate) {
        if (!isValidDate(startDate)) {
            return { isValid: false, error: 'Start date is invalid' };
        }
        return { isValid: true, error: '' };
    }
    
    // Both dates provided - validate both
    if (!isValidDate(startDate)) {
        return { isValid: false, error: 'Start date is invalid' };
    }
    
    if (!isValidDate(endDate)) {
        return { isValid: false, error: 'End date is invalid' };
    }
    
    // Check if start date is before or equal to end date
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
        return { isValid: false, error: 'Start date must be before or equal to end date' };
    }
    
    return { isValid: true, error: '' };
};

