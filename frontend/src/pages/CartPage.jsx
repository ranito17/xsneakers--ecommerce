import React, { useEffect } from 'react';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';

import CartItems from '../components/cart/CartItems';
import CartSummary from '../components/cart/CartSummary';
import CartActions from '../components/cart/CartActions';
import styles from './pages.module.css';

import { orderApi } from '../services/orderApi';
    
const CartPage = () => {
  

    // Get cart data and functions from context
    const { 
        cartItems, 
        cartCount, 
        cartTotal, 
        isLoading: cartLoading, 
        error: cartError,
        updateQuantity,
        removeFromCart,
        clearCart,
        loadCartFromBackend
    } = useCart();
    
    // Auth state
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    
    // Load cart when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            console.log('🛒 CartPage: User authenticated, loading cart...');
            loadCartFromBackend();
        }
    }, [isAuthenticated]);
    
    console.log('CartPage rendered with:', { 
        cartItems, 
        cartCount, 
        cartTotal, 
        isAuthenticated, 
        authLoading,
        cartLoading,
        cartError,
        user 
    });
    
    // Show loading state while checking authentication or loading cart
    const isPageLoading = authLoading || (isAuthenticated && cartLoading);

    const handlePlaceOrder = async () => {
        try {
            const orderData = {
                user_id: user.id,
                total_amount: cartTotal,
                payment_status: 'paid',
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    selected_color: item.selected_color,
                    selected_size: item.selected_size
                }))
            };
            console.log('Order data:', orderData);
            const result = await orderApi.placeOrder(orderData);
            
            // Show success message with order number
            alert(`Order placed successfully! Your order number is: ${result.orderNumber}`);
            
            // Clear the cart after successful order
            clearCart();
            
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        }
    };

    return (
        <div className={styles.cartPage}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <h1>Shopping Cart</h1>
                <p>{cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart</p>
            </div>

            {/* Main Content */}
            <div className={styles.cartContent}>
                {isPageLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>{authLoading ? 'Checking authentication...' : 'Loading your cart...'}</p>
                    </div>
                ) : !isAuthenticated ? (
                    <div className={styles.authRequired}>
                        <svg className={styles.lockIcon} width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <circle cx="12" cy="16" r="1"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <h2>Authentication Required</h2>
                        <p>Please login to access your cart and checkout</p>
                        <a href="/login" className={styles.loginButton}>
                            Login to Continue
                        </a>
                    </div>
                ) : cartError ? (
                    <div className={styles.errorState}>
                        <svg className={styles.errorIcon} width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        <h2>Error Loading Cart</h2>
                        <p>{cartError}</p>
                        <button 
                            onClick={loadCartFromBackend} 
                            className={styles.retryButton}
                            disabled={cartLoading}
                        >
                            {cartLoading ? 'Retrying...' : 'Try Again'}
                        </button>
                    </div>
                ) : cartCount > 0 ? (
                    <>
                        {/* Cart Items Section */}
                        <div className={styles.cartSection}>
                            <CartItems 
                                cartItems={cartItems}
                                updateQuantity={updateQuantity}
                                removeFromCart={removeFromCart}
                                isLoading={cartLoading}
                            />
                        </div>

                        {/* Cart Summary Section */}
                        <div className={styles.summarySection}>
                            <CartSummary 
                                cartItems={cartItems}
                                cartTotal={cartTotal}
                            />
                            <CartActions 
                                cartTotal={cartTotal}
                                clearCart={clearCart}
                                isLoading={cartLoading}
                                handlePlaceOrder={handlePlaceOrder}
                            />
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyCart}>
                        <svg className={styles.emptyCartIcon} width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added any items to your cart yet.</p>
                        <a href="/products" className={styles.continueShopping}>
                            Continue Shopping
                        </a>
                    </div>
                )}
                        </div>
        </div>
    );
};

export default CartPage; 