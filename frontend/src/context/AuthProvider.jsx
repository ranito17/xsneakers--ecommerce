/**
 * Provider לאימות - AuthProvider
 * 
 * Provider זה מספק גישה גלובלית לאימות המשתמש בכל האפליקציה.
 * מטפל בהתחברות, התנתקות ובדיקת אימות.
 * 
 * API Calls:
 * - authApi.checkAuth() - בודק אם המשתמש מאומת
 * - authApi.login() - מתחבר למשתמש
 * - authApi.logout() - מתנתק מהמשתמש
 * 
 * תכונות:
 * - בדיקת אימות אוטומטית בעת טעינת האפליקציה
 * - ניהול state של משתמש ואימות
 * - ניקוי עגלה בעת התנתקות
 * 
 * @param {ReactNode} children - רכיבי הילדים לעטיפה
 */
import React, { useState, useEffect, createContext, useCallback } from 'react';
import { authApi } from '../services';
import { clearCartFromStorage } from '../utils/cartUtils';

// יצירת Context לאימות
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * בודק אם המשתמש מאומת בעת טעינת האפליקציה
     * 
     * API Call: authApi.checkAuth()
     * 
     * @returns {Promise<void>}
     * 
     * תהליך:
     * 1. קורא ל-authApi.checkAuth()
     * 2. אם המשתמש מאומת - מעדכן state
     * 3. אם לא - מאפס state
     * 4. מטפל בשגיאות
     */
    const checkAuth = async () => {
        try {
            setIsLoading(true);

            const response = await authApi.checkAuth();

            if (response.success && response.user) {
                setUser(response.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (err) {
            // Clear any existing user data
            setUser(null);
            setIsAuthenticated(false);
            setError(null); // Clear any previous errors
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * מתחבר למשתמש
     * 
     * API Call: authApi.login(email, password)
     * 
     * @param {string} email - אימייל המשתמש
     * @param {string} password - סיסמת המשתמש
     * @returns {Promise<Object>} { success: boolean, user?: Object, error?: string }
     * 
     * תהליך:
     * 1. קורא ל-authApi.login()
     * 2. אם הצליח - מעדכן state עם נתוני המשתמש
     * 3. מחזיר תוצאה
     */
    const login = async (email, password) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await authApi.login(email, password);

            if (response.success && response.user) {
                setUser(response.user);
                setIsAuthenticated(true);
                return { success: true, user: response.user };
            } else {
                return { success: false, error: 'Login response missing user data' };
            }
        } catch (err) {
            console.error('AuthProvider: Login error:', err);
            setError(err.response?.data?.message || 'Login failed');
            return { success: false, error: err.response?.data?.message || 'Login failed' };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * מתנתק מהמשתמש
     * 
     * API Call: authApi.logout()
     * 
     * @returns {Promise<void>}
     * 
     * תהליך:
     * 1. קורא ל-authApi.logout()
     * 2. מאפס את state של המשתמש
     * 3. מנקה את עגלת הקניות מ-localStorage
     */
    const logout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            clearCartFromStorage(); // Clear cart on logout
        }
    };

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const value = {
        user,
        isAuthenticated,
        login,
        logout,
        checkAuth,
        isLoading,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 