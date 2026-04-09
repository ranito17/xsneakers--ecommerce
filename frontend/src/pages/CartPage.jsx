import React from 'react';
import { useAuth } from '../hooks/useAuthentication';
import { useCart } from '../hooks/useCart';
import { useSettings } from '../context/SettingsProvider';
import { useToast } from '../components/common/toast';
import { calculateOrderSummary } from '../utils/price.utils';
import CartItems from '../components/cart/CartItems';
import CartSummary from '../components/cart/CartSummary';
import CartActions from '../components/cart/CartActions';
import { LoadingContainer, ErrorContainer } from '../components/contactForm';
import EmptyCart from '../components/cart/EmptyCart';
import styles from './pages.module.css';

const CartPage = () => {
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const { 
        cartItems, 
        cartTotal, 
        cartCount, 
        updateQuantity, 
        removeFromCart, 
        clearCart, 
        loading: cartLoading, 
        error: cartError,
    } = useCart();
    const { settings } = useSettings();
    const { showWarning } = useToast();
    const taxRate = (settings.tax_rate || 0) / 100;
    const deliverySettings = {
        freeDeliveryThreshold: settings.free_delivery_threshold || 100,
        flatDeliveryCost: settings.default_delivery_cost || 10,
        deliveryEnabled: true
    };
    const orderSummary = calculateOrderSummary(cartItems, taxRate, deliverySettings);
    const { subtotal, deliveryCost, taxAmount, total: totalWithTaxAndDelivery } = orderSummary;


    // handleCheckout - בודק תקינות עגלה ומעביר לדף התשלום
    // שליחה לשרת: אין - מעבר לדף אחר
    // תגובה מהשרת: אין - מעבר לדף אחר
    const handleCheckout = () => {
        if (!isAuthenticated) {
            window.location.href = '/login?redirect=/cart';
            return;
        }
        const itemsWithoutSize = cartItems.filter(item => {
            const hasSizes = item.sizes && (
                (Array.isArray(item.sizes) && item.sizes.length > 0) ||
                (typeof item.sizes === 'string' && item.sizes.trim() !== '[]' && item.sizes.trim() !== '')
            );
            return hasSizes && !item.selected_size;
        });
        if (itemsWithoutSize.length > 0) {
            showWarning('Please select a size for all products before checkout.');
            return;
        }
        window.location.href = '/payment';
    };


    const isPageLoading = authLoading || cartLoading;
    const shouldShowCartContent = !isPageLoading && !cartError;
    return (
        <div className={styles.cartPage}>
            <div className={styles.cartContent}>
                {isPageLoading ? (
                    <LoadingContainer 
                        message={authLoading ? 'Checking authentication...' : 'Loading your cart...'} 
                        size="medium" 
                    />
                ) : cartError ? (
                    <ErrorContainer 
                        message={cartError}
                        onRetry={() => window.location.reload()}
                    />
                ) : shouldShowCartContent && cartCount > 0 ? (
                    <>
                        <div className={styles.cartSection}>
                            <CartItems 
                                cartItems={cartItems}
                                updateQuantity={updateQuantity}
                                removeFromCart={removeFromCart}
                                isLoading={cartLoading}
                                currency={settings?.currency || 'ILS'}
                            />
                        </div>
                        <div className={styles.summarySection}>
                            <CartSummary 
                                cartItems={cartItems}
                                cartTotal={subtotal}
                                totalWithTaxAndDelivery={totalWithTaxAndDelivery}
                            />
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
                                            <p>Please log in to complete your purchase. Your cart items will be saved and transferred to your account.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <CartActions 
                                cartTotal={cartTotal}
                                clearCart={clearCart}
                                isLoading={cartLoading}
                                handleCheckout={handleCheckout}
                                isAuthenticated={isAuthenticated}
                            />
                        </div>
                    </>
                ) : shouldShowCartContent && cartCount === 0 ? (
                    <EmptyCart />
                ) : null}
            </div>
        </div>
    );
};

export default CartPage; 
