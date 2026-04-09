/**
 * Hook לשימוש באימות - useAuth
 * 
 * Hook זה מספק גישה לכל הפונקציות והנתונים של אימות המשתמש.
 * חייב להיות בשימוש בתוך AuthProvider.
 * 
 * @returns {Object} אובייקט עם:
 *   - user: Object - אובייקט המשתמש הנוכחי
 *   - isAuthenticated: boolean - האם המשתמש מאומת
 *   - login: Function - פונקציה להתחברות
 *   - logout: Function - פונקציה להתנתקות
 *   - checkAuth: Function - פונקציה לבדיקת אימות
 *   - isLoading: boolean - מצב טעינה
 *   - error: string - הודעת שגיאה
 */
import { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth חייב להיות בשימוש בתוך AuthProvider');
    }
    
    return context;
}; 