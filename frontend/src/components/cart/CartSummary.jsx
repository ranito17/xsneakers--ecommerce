import React from 'react';
import styles from './cartSummary.module.css';

const CartSummary = ({ cartItems, cartTotal }) => {
    // Calculate summary values
    const subtotal = cartTotal;
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    return (
        <div className={styles.cartSummary}>
            <h2>Order Summary</h2>
            
            <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                    <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className={styles.summaryRow}>
                    <span>Shipping</span>
                    <span className={shipping === 0 ? styles.freeShipping : ''}>
                        {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                </div>
                
                <div className={styles.summaryRow}>
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                </div>
                
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            {shipping > 0 && (
                <div className={styles.shippingNote}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>Add ${(100 - subtotal).toFixed(2)} more for free shipping!</span>
                </div>
            )}

            {shipping === 0 && (
                <div className={styles.freeShippingBadge}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4"/>
                        <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                        <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                    </svg>
                    <span>Free Shipping!</span>
                </div>
            )}
        </div>
    );
};

export default CartSummary; 