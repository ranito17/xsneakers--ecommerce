import React, { useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuthentication';

import CartItems from '../components/cart/CartItems';
import CartSummary from '../components/cart/CartSummary';
import CartActions from '../components/cart/CartActions';
import LoadingContainer from '../components/loading/LoadingContainer';
import ErrorContainer from '../components/error/ErrorContainer';
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
    
    // Load cart when user is available
    useEffect(() => {
        if (user?.id) {
            console.log('🛒 CartPage: User available, loading cart...');
            loadCartFromBackend();
        }
    }, [user?.id]);
    
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
    const isPageLoading = authLoading || cartLoading;

    const handlePlaceOrder = async () => {
        if (!isAuthenticated) {
            // Redirect to login with return URL
            window.location.href = '/login?redirect=/cart';
            return;
        }

        try {
            const orderData = {
                user_id: user.id,
                total_amount: cartTotal,
                payment_status: 'paid',
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
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

    const handleCheckout = () => {
        if (!isAuthenticated) {
            // Redirect to login with return URL
            window.location.href = '/login?redirect=/cart';
            return;
        }
        
        // Proceed with checkout for authenticated users
        handlePlaceOrder();
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
                    <LoadingContainer 
                        message={authLoading ? 'Checking authentication...' : 'Loading your cart...'} 
                        size="medium" 
                    />
                ) : cartError ? (
                    <ErrorContainer 
                        message={cartError}
                        onRetry={loadCartFromBackend}
                    />
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
                            
                            {/* Guest User Notice */}
                            {!isAuthenticated && (
                                <div className={styles.guestNotice}>
                                    <div className={styles.guestNoticeContent}>
                                        <svg className={styles.guestIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                            <polyline points="10,17 15,12 10,7"/>
                                            <line x1="15" y1="12" x2="3" y2="12"/>
                                        </svg>
                                        <div className={styles.guestText}>
                                            <h3>Ready to Checkout?</h3>
                                            <p>Please log in to complete your purchase and save your cart for future visits.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <CartActions 
                                cartTotal={cartTotal}
                                clearCart={clearCart}
                                isLoading={cartLoading}
                                handlePlaceOrder={handleCheckout}
                                isAuthenticated={isAuthenticated}
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