import React from 'react';
import styles from './cartActions.module.css';


const CartActions = ({ cartTotal, clearCart, isLoading,handlePlaceOrder }) => {


    const handleCheckout = () => {
        handlePlaceOrder();
    };

    const handleContinueShopping = () => {
        // TODO: Implement continue shopping functionality
        window.location.href = '/products';
    };

    const handleClearCart = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            clearCart();
        }
    };

    return (
        <div className={styles.cartActions}>
            <button
                className={styles.checkoutButton}
                onClick={handleCheckout}
                disabled={cartTotal === 0 || isLoading}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                </svg>
                Proceed to Checkout
            </button>
            
            <button
                className={styles.continueShoppingButton}
                onClick={handleContinueShopping}
                disabled={isLoading}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5"/>
                    <path d="M12 19l-7-7 7-7"/>
                </svg>
                Continue Shopping
            </button>

            <button
                className={styles.clearCartButton}
                onClick={handleClearCart}
                disabled={cartTotal === 0 || isLoading}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Clear Cart
            </button>
        </div>
    );
};

export default CartActions; 