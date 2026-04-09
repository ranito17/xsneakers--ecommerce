/**
 * Hook לשימוש בעגלת קניות - useCart
 * 
 * Hook זה מספק גישה לכל הפונקציות והנתונים של עגלת הקניות.
 * חייב להיות בשימוש בתוך CartProvider.
 * 
 * @returns {Object} אובייקט עם:
 *   - cartItems: Array - מערך פריטי העגלה
 *   - cartCount: number - סך כמות הפריטים
 *   - cartTotal: number - סך המחיר
 *   - addToCart: Function - פונקציה להוספת מוצר לעגלה
 *   - removeFromCart: Function - פונקציה להסרת פריט מעגלה
 *   - updateQuantity: Function - פונקציה לעדכון כמות
 *   - clearCart: Function - פונקציה לניקוי העגלה
 *   - isInCart: Function - פונקציה לבדיקה אם מוצר בעגלה
 *   - isLoading: boolean - מצב טעינה
 *   - error: string - הודעת שגיאה
 *   - loadCart: Function - פונקציה לטעינת העגלה
 */
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export const useCart = () => {
    const context = useContext(CartContext);
    
    if (!context) {
        throw new Error('useCart חייב להיות בשימוש בתוך CartProvider');
    }
    
    return context;
}; 