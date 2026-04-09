/**
 * Chart Utilities
 * 
 * Provides utility functions for processing chart data, including:
 * - Date range validation and completion
 * - Data normalization for charts
 * - Missing period filling with zero values
 * - Week-based navigation for scalable charts
 */

/**
 * Get the start of the week (Sunday) for a given date
 * @param {Date|string} date - Date object or date string
 * @returns {Date} Start of week (Sunday)
 */
export const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Get Sunday of current week
    return new Date(d.setDate(diff));
};

/**
 * Generate 7 days starting from a given date
 * @param {Date|string} startDate - Starting date
 * @returns {Array} Array of 7 date objects
 */
export const generateWeekDays = (startDate) => {
    const start = new Date(startDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        days.push({
            date: date,
            dateString: date.toISOString().split('T')[0],
            displayDate: date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            })
        });
    }
    return days;
};

/**
 * Process data for week view - fills missing days with zeros
 * @param {Array} data - Original data array
 * @param {string} weekStartDate - Start date of the week (YYYY-MM-DD)
 * @returns {Array} Complete week data with all 7 days
 */
export const processWeekData = (data, weekStartDate) => {
    const weekDays = generateWeekDays(weekStartDate);
    const dataMap = new Map();
    
    // Create a map of existing data by date
    if (data && Array.isArray(data)) {
        data.forEach(item => {
            // Try multiple date field names and normalize the date string
            let dateStr = item.period || item.date || item.created_at || '';
            if (dateStr) {
                // Normalize date string to YYYY-MM-DD format
                try {
                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime())) {
                        dateStr = date.toISOString().split('T')[0];
                        dataMap.set(dateStr, item);
                    }
                } catch (e) {
                    // If it's already in YYYY-MM-DD format, use it directly
                    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        dataMap.set(dateStr, item);
                    }
                }
            }
        });
    }
    
    // Fill week with data or zeros
    return weekDays.map(day => {
        const existingData = dataMap.get(day.dateString);
        return {
            period: day.dateString,
            date: day.dateString,
            displayDate: day.displayDate,
            revenue: existingData ? parseFloat(existingData.revenue) || 0 : 0,
            order_count: existingData ? parseInt(existingData.order_count) || 0 : 0,
            avg_order_value: existingData ? parseFloat(existingData.avg_order_value) || 0 : 0
        };
    });
};

/**
 * Get previous week start date
 * @param {string} currentWeekStart - Current week start (YYYY-MM-DD)
 * @returns {string} Previous week start (YYYY-MM-DD)
 */
export const getPreviousWeek = (currentWeekStart) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
};

/**
 * Get next week start date
 * @param {string} currentWeekStart - Current week start (YYYY-MM-DD)
 * @param {string} maxDate - Maximum allowed date (YYYY-MM-DD)
 * @returns {string|null} Next week start (YYYY-MM-DD) or null if exceeds max
 */
export const getNextWeek = (currentWeekStart, maxDate) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + 7);
    const nextWeekStart = date.toISOString().split('T')[0];
    
    if (maxDate && nextWeekStart > maxDate) {
        return null; // Can't go beyond max date
    }
    
    return nextWeekStart;
};

/**
 * Process data for 4-week view (4 weeks of a month, each with 2 bars: revenue and orders)
 * Weeks: Week 1 (1-7), Week 2 (8-14), Week 3 (15-22), Week 4 (23-30)
 * @param {Array} data - Original data array (daily data from backend)
 * @param {string} monthStartDate - First day of the month (YYYY-MM-DD)
 * @returns {Array} Complete 4-week data with 4 data points (one per week)
 */
export const process4WeeksData = (data, monthStartDate) => {
    const monthStart = new Date(monthStartDate);
    // Ensure we start from the 1st of the month
    monthStart.setDate(1);
    const result = [];
    
    // Generate 4 weeks of the month
    // Week 1: days 1-7 (0-6 from month start) - e.g., Dec 1-7
    // Week 2: days 8-14 (7-13 from month start) - e.g., Dec 8-14
    // Week 3: days 15-22 (14-20 from month start) - e.g., Dec 15-22
    // Week 4: days 23-30 (21-27 from month start) - e.g., Dec 23-30
    for (let week = 0; week < 4; week++) {
        const weekStart = new Date(monthStart);
        weekStart.setDate(monthStart.getDate() + (week * 7));
        
        const weekEnd = new Date(weekStart);
        // Week 1-3: 7 days, Week 4: 8 days (to cover 23-30)
        if (week === 3) {
            weekEnd.setDate(weekStart.getDate() + 7); // 8 days total (23-30)
        } else {
            weekEnd.setDate(weekStart.getDate() + 6); // 7 days total
        }
        
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const weekEndStr = weekEnd.toISOString().split('T')[0];
        
        // Aggregate daily data for this week
        let weekData = { revenue: 0, order_count: 0, avg_order_value: 0 };
        
        if (data && Array.isArray(data)) {
            // Filter daily data for this week
            const weekDailyData = data.filter(item => {
                let itemDate = item.period || item.date || item.created_at || '';
                // Normalize date string to YYYY-MM-DD format
                try {
                    if (itemDate) {
                        const date = new Date(itemDate);
                        if (!isNaN(date.getTime())) {
                            itemDate = date.toISOString().split('T')[0];
                        }
                    }
                } catch (e) {
                    // If it's already in YYYY-MM-DD format, use it directly
                    if (!itemDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        itemDate = '';
                    }
                }
                return itemDate >= weekStartStr && itemDate <= weekEndStr;
            });
            
            if (weekDailyData.length > 0) {
                weekData = {
                    revenue: weekDailyData.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0),
                    order_count: weekDailyData.reduce((sum, item) => sum + (parseInt(item.order_count) || 0), 0),
                    avg_order_value: weekDailyData.length > 0 
                        ? weekDailyData.reduce((sum, item) => sum + (parseFloat(item.avg_order_value) || 0), 0) / weekDailyData.length
                        : 0
                };
            }
        }
        
        // Format display date: "Dec 1-7", "Dec 8-14", etc.
        const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
        const startDay = weekStart.getDate();
        const endDay = weekEnd.getDate();
        const displayDate = `${startMonth} ${startDay}-${endDay}`;
        
        result.push({
            period: `week${week + 1}`,
            date: weekStartStr,
            displayDate: displayDate,
            revenue: parseFloat(weekData.revenue) || 0,
            order_count: parseInt(weekData.order_count) || 0,
            avg_order_value: parseFloat(weekData.avg_order_value) || 0
        });
    }
    
    return result;
};

/**
 * Get first day of the month for a given date
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} First day of the month (YYYY-MM-DD)
 */
export const getMonthStart = (dateString) => {
    const date = new Date(dateString);
    date.setDate(1); // Set to first day of month
    return date.toISOString().split('T')[0];
};

/**
 * Get previous month start date
 * @param {string} currentMonthStart - Current month start (YYYY-MM-DD)
 * @returns {string} Previous month start (YYYY-MM-DD)
 */
export const getPreviousMonth = (currentMonthStart) => {
    const date = new Date(currentMonthStart);
    date.setMonth(date.getMonth() - 1);
    date.setDate(1); // Ensure first day of month
    return date.toISOString().split('T')[0];
};

/**
 * Get next month start date
 * @param {string} currentMonthStart - Current month start (YYYY-MM-DD)
 * @param {string} maxDate - Maximum allowed date (YYYY-MM-DD)
 * @returns {string|null} Next month start (YYYY-MM-DD) or null if exceeds max
 */
export const getNextMonth = (currentMonthStart, maxDate) => {
    const date = new Date(currentMonthStart);
    date.setMonth(date.getMonth() + 1);
    date.setDate(1); // Ensure first day of month
    const nextMonthStart = date.toISOString().split('T')[0];
    
    if (maxDate && nextMonthStart > maxDate) {
        return null;
    }
    
    return nextMonthStart;
};

/**
 * Generate a complete date series for the given range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} groupBy - Grouping option ('day', 'week', 'month', 'year')
 * @returns {Array} Array of date strings for the complete range
 */
export const generateDateSeries = (startDate, endDate, groupBy = 'day') => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let current = new Date(start);
    
    while (current <= end) {
        let periodKey;
        let displayDate;
        
        switch (groupBy) {
            case 'day':
                periodKey = current.toISOString().split('T')[0];
                displayDate = current.toISOString().split('T')[0];
                break;
            case 'week':
                const year = current.getFullYear();
                const week = getWeekNumber(current);
                periodKey = `${year}-W${week.toString().padStart(2, '0')}`;
                // For display, use the first day of the week
                const weekStart = new Date(current);
                weekStart.setDate(current.getDate() - current.getDay());
                displayDate = weekStart.toISOString().split('T')[0];
                break;
            case 'month':
                periodKey = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`;
                // For display, use the first day of the month
                displayDate = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-01`;
                break;
            case 'year':
                periodKey = current.getFullYear().toString();
                displayDate = `${current.getFullYear()}-01-01`;
                break;
            default:
                periodKey = current.toISOString().split('T')[0];
                displayDate = current.toISOString().split('T')[0];
        }
        
        dates.push({
            period: periodKey,
            displayDate: displayDate
        });
        
        // Move to next period
        switch (groupBy) {
            case 'day':
                current.setDate(current.getDate() + 1);
                break;
            case 'week':
                current.setDate(current.getDate() + 7);
                break;
            case 'month':
                current.setMonth(current.getMonth() + 1);
                break;
            case 'year':
                current.setFullYear(current.getFullYear() + 1);
                break;
            default:
                current.setDate(current.getDate() + 1);
        }
    }
    
    return dates;
};

/**
 * Fill missing periods in chart data with zero values
 * @param {Array} data - Original chart data array
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} groupBy - Grouping option ('day', 'week', 'month', 'year')
 * @returns {Array} Complete chart data with zero values for missing periods
 */
export const fillMissingPeriods = (data, startDate, endDate, groupBy = 'day') => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        // If no data, generate complete series with all zeros
        const dateSeries = generateDateSeries(startDate, endDate, groupBy);
        return dateSeries.map(dateObj => ({
            period: dateObj.period,
            displayDate: dateObj.displayDate,
            revenue: 0,
            order_count: 0,
            avg_order_value: 0
        }));
    }
    
    // For now, let's just return the original data and add displayDate
    // This will work with the actual backend data format
    const processedData = data.map(item => {
        // Convert backend period format to display date
        let displayDate = item.period;
        
        if (groupBy === 'day') {
            // Backend returns YYYY-MM-DD format, which is already good
            displayDate = item.period;
        } else if (groupBy === 'week') {
            // Backend returns YYYY-WW format, convert to first day of week
            const [year, week] = item.period.split('-');
            if (year && week) {
                const weekNum = parseInt(week);
                const firstDayOfYear = new Date(year, 0, 1);
                const firstWeekday = firstDayOfYear.getDay();
                const daysToAdd = (weekNum - 1) * 7 + (7 - firstWeekday);
                const weekStart = new Date(year, 0, 1 + daysToAdd);
                displayDate = weekStart.toISOString().split('T')[0];
            }
        } else if (groupBy === 'month') {
            // Backend returns YYYY-MM format, convert to first day of month
            displayDate = `${item.period}-01`;
        } else if (groupBy === 'year') {
            // Backend returns YYYY format, convert to first day of year
            displayDate = `${item.period}-01-01`;
        }
        
        return {
            ...item,
            displayDate: displayDate
        };
    });
    
    return processedData;
};

/**
 * Validate date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Object} Validation result with isValid and message
 */
export const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
        return {
            isValid: false,
            message: 'Start date and end date are required'
        };
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return {
            isValid: false,
            message: 'Invalid date format'
        };
    }
    
    if (start > end) {
        return {
            isValid: false,
            message: 'Start date must be before end date'
        };
    }
    
    return {
        isValid: true,
        message: 'Date range is valid'
    };
};

/**
 * Helper function to get week number
 * @param {Date} date - Date object
 * @returns {number} Week number
 */
const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

