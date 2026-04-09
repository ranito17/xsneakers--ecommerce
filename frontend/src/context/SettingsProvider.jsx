/**
 * Provider להגדרות - SettingsProvider
 * 
 * Provider זה מספק גישה גלובלית להגדרות החנות בכל האפליקציה.
 * מטפל בהגדרות ציבוריות (ללא אימות) והגדרות מוגנות (דורש אימות).
 * 
 * API Calls:
 * - settingsApi.getSettings() - טעינת הגדרות מוגנות (אדמין בלבד)
 * - settingsApi.getPublicSettings() - טעינת הגדרות ציבוריות (ללא אימות)
 * - settingsApi.updateSettings() - עדכון הגדרות (אדמין בלבד)
 * 
 * תכונות:
 * - הגדרות ציבוריות נטענות אוטומטית בעת טעינת האפליקציה
 * - הגדרות מוגנות נטענות רק כאשר נדרשות (על ידי קריאה ל-fetchSettings)
 * - פונקציות עזר לחישובי מלאי, מחיר, משלוח
 * 
 * @param {ReactNode} children - רכיבי הילדים לעטיפה
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../services/settingsApi';

// יצירת Context להגדרות
const SettingsContext = createContext();

/**
 * Hook לשימוש בהגדרות - useSettings
 * 
 * @returns {Object} אובייקט עם:
 *   - settings: Object - כל ההגדרות
 *   - publicSettings: Object - הגדרות ציבוריות בלבד
 *   - loading: boolean - מצב טעינה
 *   - updating: boolean - מצב עדכון
 *   - error: string - הודעת שגיאה
 *   - fetchSettings: Function - טעינת הגדרות מוגנות
 *   - fetchPublicSettings: Function - טעינת הגדרות ציבוריות
 *   - updateSettings: Function - עדכון הגדרות
 *   - getSetting: Function - קבלת הגדרה ספציפית
 *   - isLowStock: Function - בדיקה אם מלאי נמוך
 *   - getStockStatus: Function - קבלת סטטוס מלאי
 *   - clearError: Function - ניקוי שגיאה
 */
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings חייב להיות בשימוש בתוך SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    // State for all settings
    const [settings, setSettings] = useState({
        // Store Information
        store_name: 'My Store',
        supplier_name: 'Supplier Name',
        supplier_email: '',
        
        // Financial Settings
        tax_rate: 0.00,
        currency: 'ILS',
        default_delivery_cost: 0.00,
        free_delivery_threshold: 0.00,
        
        // Notification Settings
        email_notification: '',
        
        // Social Media
        store_instagram: '',
        
        // Best Sellers Settings
        best_sellers_time_range: '30d',
        best_sellers_limit: 6,
        
        // Stock Management
        low_stock_threshold: 10,
        
        // Display Settings
        homepage_display_limit: 8
    });

    // Public settings (for footer, etc.)
    const [publicSettings, setPublicSettings] = useState({
        store_name: 'My Store',
        supplier_email: '',
        store_instagram: '',
        currency: 'ILS',
        default_delivery_cost: 0.00,
        free_delivery_threshold: 0.00
    });

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    /**
     * טוען את כל ההגדרות (אדמין בלבד)
     * 
     * API Call: settingsApi.getSettings()
     * 
     * @returns {Promise<void>}
     * 
     * תהליך:
     * 1. קורא ל-settingsApi.getSettings()
     * 2. ממפה שמות עמודות מהבקאנד לפרונטאנד
     * 3. מעדכן את state עם ההגדרות
     * 4. מטפל בשגיאות (לא מציג שגיאה אם זה בגלל אימות)
     */
    const fetchSettings = useCallback(async () => {
        try {
            setError(null);
            
            const response = await settingsApi.getSettings();
            
            if (response.success && response.data) {
                // Map backend column names to frontend names
                const mappedSettings = {
                    // Store Information
                    store_name: response.data.store_name || 'My Store',
                    supplier_name: response.data.supplier_name || 'Supplier Name',
                    supplier_email: response.data.supplier_email || '',
                    
                    // Financial Settings
                    tax_rate: parseFloat(response.data.tax_rate) || 0.00,
                    currency: response.data.currency || 'USD',
                    default_delivery_cost: parseFloat(response.data.default_delivery_cost || response.data.default_shipping_cost) || 0.00,
                    free_delivery_threshold: parseFloat(response.data.free_delivery_threshold || response.data.free_shipping_threshold) || 0.00,
                    
                    // Notification Settings
                    email_notification: response.data.email_notification || '',
                    
                    // Social Media
                    store_instagram: response.data.store_instagram || '',
                    
                    // Best Sellers Settings
                    best_sellers_time_range: response.data.best_sellers_time_range || '30d',
                    best_sellers_limit: parseInt(response.data.best_sellers_limit) || 6,
                    
                    // Stock Management
                    low_stock_threshold: parseInt(response.data.low_stock_threshold) || 10,
                    low_stock_threshold_per_size: parseInt(response.data.low_stock_threshold_per_size) || 5,
                    
                    // Display Settings
                    homepage_display_limit: ('homepage_display_limit' in response.data && response.data.homepage_display_limit !== null) 
                        ? parseInt(response.data.homepage_display_limit) 
                        : 8
                };
                
                setSettings(mappedSettings);
            } else {
                throw new Error(response.message || 'Failed to fetch settings');
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
            // Don't set error for protected settings as it might be due to auth
            // Just log it and continue with default values
        }
    }, []); // Empty dependency array = function never changes

    /**
     * טוען הגדרות ציבוריות (ללא אימות)
     * 
     * API Call: settingsApi.getPublicSettings()
     * 
     * @returns {Promise<void>}
     * 
     * תהליך:
     * 1. קורא ל-settingsApi.getPublicSettings()
     * 2. מעדכן את publicSettings state
     * 3. מעדכן גם את settings state כגיבוי
     */
    const fetchPublicSettings = useCallback(async () => {
        try {
            const response = await settingsApi.getPublicSettings();
            
            if (response.success && response.data) {
                const publicData = {
                    store_name: response.data.store_name || 'My Store',
                    supplier_email: response.data.supplier_email || '',
                    store_instagram: response.data.store_instagram || '',
                    currency: response.data.currency || 'USD',
                    default_delivery_cost: parseFloat(response.data.default_delivery_cost) || 0.00,
                    free_delivery_threshold: parseFloat(response.data.free_delivery_threshold) || 0.00,
                    homepage_display_limit: response.data.homepage_display_limit !== undefined && response.data.homepage_display_limit !== null ? parseInt(response.data.homepage_display_limit) : 0
                };
                
                setPublicSettings(publicData);
                
                // Also update main settings with public data as fallback
                setSettings(prevSettings => ({
                    ...prevSettings,
                    store_name: publicData.store_name,
                    supplier_email: publicData.supplier_email,
                    store_instagram: publicData.store_instagram,
                    currency: publicData.currency,
                    default_delivery_cost: publicData.default_delivery_cost,
                    free_delivery_threshold: publicData.free_delivery_threshold,
                    homepage_display_limit: publicData.homepage_display_limit
                }));
            }
        } catch (err) {
            console.error('Error fetching public settings:', err);
            // Don't set error for public settings as it's not critical
        }
    }, []); // Empty dependency array = function never changes

    /**
     * מעדכן הגדרות
     * 
     * API Call: settingsApi.updateSettings(backendSettings)
     * 
     * @param {Object} newSettings - אובייקט עם ההגדרות החדשות
     * @returns {Promise<Object>} { success: boolean, message?: string }
     * 
     * תהליך:
     * 1. ממפה שמות מהפרונטאנד לבקאנד
     * 2. קורא ל-settingsApi.updateSettings()
     * 3. מעדכן את state המקומי
     * 4. מעדכן הגדרות ציבוריות אם השתנו
     */
    const updateSettings = useCallback(async (newSettings) => {
        try {
            setUpdating(true);
            setError(null);
            
            // Map frontend names back to backend column names
            const backendSettings = {
                store_name: newSettings.store_name,
                supplier_name: newSettings.supplier_name,
                supplier_email: newSettings.supplier_email,
                tax_rate: newSettings.tax_rate,
                currency: newSettings.currency,
                default_delivery_cost: newSettings.default_delivery_cost,
                free_delivery_threshold: newSettings.free_delivery_threshold,
                email_notification: newSettings.email_notification,
                store_instagram: newSettings.store_instagram,
                best_sellers_time_range: newSettings.best_sellers_time_range,
                best_sellers_limit: newSettings.best_sellers_limit,
                low_stock_threshold: newSettings.low_stock_threshold,
                low_stock_threshold_per_size: newSettings.low_stock_threshold_per_size,
                homepage_display_limit: newSettings.homepage_display_limit
            };
            
            const response = await settingsApi.updateSettings(backendSettings);
            
            if (response.success) {
                // Update local state
                setSettings(newSettings);
                
                // Update public settings if they changed
                setPublicSettings({
                    store_name: newSettings.store_name,
                    supplier_email: newSettings.supplier_email,
                    store_instagram: newSettings.store_instagram
                });
                
                return { success: true, message: 'Settings updated successfully' };
            } else {
                throw new Error(response.message || 'Failed to update settings');
            }
        } catch (err) {
            console.error('Error updating settings:', err);
            setError(err.message || 'Failed to update settings');
            return { success: false, message: err.message };
        } finally {
            setUpdating(false);
        }
    }, []); // Empty dependency array = function never changes

    /**
     * מקבל ערך הגדרה ספציפית
     * 
     * @param {string} key - מפתח ההגדרה
     * @param {*} defaultValue - ערך ברירת מחדל אם ההגדרה לא קיימת
     * @returns {*} ערך ההגדרה או ערך ברירת מחדל
     */
    const getSetting = useCallback((key, defaultValue = null) => {
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }, [settings]);

    /**
     * בודק אם מוצר במלאי נמוך
     * 
     * @param {number} stockQuantity - כמות המלאי
     * @returns {boolean} true אם המלאי נמוך (גדול מ-0 וקטן או שווה לסף)
     */
    const isLowStock = useCallback((stockQuantity) => {
        const threshold = settings.low_stock_threshold || 10;
        return stockQuantity > 0 && stockQuantity <= threshold;
    }, [settings.low_stock_threshold]);

    /**
     * מקבל סטטוס מלאי
     * 
     * @param {number} stockQuantity - כמות המלאי
     * @returns {string} 'out-of-stock', 'low-stock', או 'in-stock'
     */
    const getStockStatus = useCallback((stockQuantity) => {
        if (stockQuantity === 0) return 'out-of-stock';
        if (isLowStock(stockQuantity)) return 'low-stock';
        return 'in-stock';
    }, [isLowStock]);

    // Initialize settings on mount - only fetch public settings initially
    useEffect(() => {
        const initializeSettings = async () => {
            try {
                await fetchPublicSettings();
            } finally {
                setLoading(false);
            }
        };
        
        initializeSettings();
    }, [fetchPublicSettings]);

    // Context value
    const value = {
        // Settings data
        settings,
        publicSettings,
        
        // Loading states
        loading,
        updating,
        error,
        
        // Actions
        fetchSettings,
        fetchPublicSettings,
        updateSettings,
        getSetting,
        
        // Utility functions (settings-dependent only)
        isLowStock,
        getStockStatus,
        
        // Clear error
        clearError: () => setError(null)
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsProvider;
