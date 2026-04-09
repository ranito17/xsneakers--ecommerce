import React from 'react';
import styles from './emptyCart.module.css';

const EmptyCart = () => {
    return (
        <div className={styles.emptyCart}>
            <div className={styles.emptyCartIcon}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
            </div>
            
            <h2 className={styles.emptyCartTitle}>Your cart is empty</h2>
            <p className={styles.emptyCartDescription}>
                Looks like you haven't added any items to your cart yet. Start shopping to discover amazing products!
            </p>
            
            <a href="/products" className={styles.continueShoppingButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5"/>
                    <path d="M12 19l-7-7 7-7"/>
                </svg>
                Continue Shopping
            </a>
        </div>
    );
};

export default EmptyCart;
