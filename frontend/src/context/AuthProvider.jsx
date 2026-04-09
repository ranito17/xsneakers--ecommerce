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
                console.log('✅ Frontend: User authenticated:', response.user);
                setUser(response.user);
                setIsAuthenticated(true);
                console.log('✅ Frontend: State updated - user set, isAuthenticated: true');
            } else {
                console.log('❌ Frontend: No user data in response');
                console.log('❌ Frontend: response.success:', response.success);
                console.log('❌ Frontend: response.user:', response.user);
                setUser(null);
                setIsAuthenticated(false);
                console.log('❌ Frontend: State updated - user: null, isAuthenticated: false');
            }
        } catch (err) {
            console.log('❌ Frontend: Authentication request failed');
            console.log('❌ Frontend: Error status:', err.response?.status);
            console.log('❌ Frontend: Error data:', err.response?.data);
            console.log('❌ Frontend: Error message:', err.message);
            // Clear any existing user data
            setUser(null);
            setIsAuthenticated(false);
            setError(null); // Clear any previous errors
            console.log('❌ Frontend: State cleared - user: null, isAuthenticated: false');
        } finally {
            setIsLoading(false);
            console.log('🔍 Frontend: Loading state set to false');
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
            console.log('🔐 AuthProvider: Starting login process...');
            setIsLoading(true);
            setError(null);
            
            const response = await authApi.login(email, password);

            console.log('🔐 AuthProvider: Login API response:', response);

            if (response.success && response.user) {
                // Immediately set user data and authentication state
                console.log('🔐 AuthProvider: Setting user state to:', response.user);
                setUser(response.user);
                setIsAuthenticated(true);
                console.log('✅ AuthProvider: User logged in successfully:', response.user);
                console.log('✅ AuthProvider: State updated - isAuthenticated: true, user.id:', response.user.id);
                return { success: true,user:response.user };
            } else {
                console.log('❌ AuthProvider: Login response missing user data');
                console.log('❌ AuthProvider: response.success:', response.success);
                console.log('❌ AuthProvider: response.user:', response.user);
                return { success: false, error: 'Login response missing user data' };
            }
        } catch (err) {
            console.error('❌ AuthProvider: Login error:', err);
            setError(err.response?.data?.message || 'Login failed');
            return { success: false, error: err.response?.data?.message || 'Login failed' };
        } finally {
            setIsLoading(false);
            console.log('🔐 AuthProvider: Login process completed');
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
            console.log('🔐 AuthProvider: Starting logout process...');
            await authApi.logout();
            console.log('🔐 AuthProvider: Backend logout successful');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Immediately clear user state
            console.log('🔐 AuthProvider: Clearing user state and cart');
            setUser(null);
            setIsAuthenticated(false);
            clearCartFromStorage(); // Clear cart on logout
            console.log('🔐 AuthProvider: Logout process completed');
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