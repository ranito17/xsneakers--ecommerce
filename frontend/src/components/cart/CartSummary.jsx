import React from 'react';
import { useSettings } from '../../context/SettingsProvider';
import { calculateOrderSummary, formatPrice as formatPriceUtil } from '../../utils/price.utils';
import styles from './cartSummary.module.css';

const CartSummary = ({ cartItems, cartTotal, totalWithDelivery }) => {
    const { settings } = useSettings();

    // Calculate order summary using centralized utility
    const taxRate = (settings.tax_rate || 0) / 100;
    const deliverySettings = {
        freeDeliveryThreshold: settings.free_delivery_threshold || 100,
        flatDeliveryCost: settings.default_delivery_cost || 10,
        deliveryEnabled: true
    };
    
    const orderSummary = calculateOrderSummary(cartItems, taxRate, deliverySettings);
    const { subtotal, deliveryCost, taxAmount, total } = orderSummary;
    
    const finalTotal = totalWithDelivery || total;
    
    // Use format price from utils
    const formatPrice = (amount) => formatPriceUtil(amount, settings.currency || '$');

    return (
        <div className={styles.cartSummary}>
            <h2>Order Summary</h2>
            
            <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                    <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                
                {taxAmount > 0 && (
                    <div className={styles.summaryRow} style={{ fontSize: '0.85rem', color: '#64748b', paddingLeft: '1rem' }}>
                        <span>Includes tax ({((settings.tax_rate || 0)).toFixed(0)}%)</span>
                        <span>{formatPrice(taxAmount)}</span>
                    </div>
                )}
                
                <div className={styles.summaryRow}>
                    <span>Delivery Cost</span>
                    <span className={deliveryCost === 0 ? styles.freeDelivery : styles.deliveryCost}>
                        {deliveryCost === 0 ? 'Free' : formatPrice(deliveryCost)}
                    </span>
                </div>
                
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                </div>
            </div>

            {deliveryCost > 0 && (
                <div className={styles.deliveryNote}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>Add more for free delivery!</span>
                </div>
            )}

            {deliveryCost === 0 && (
                <div className={styles.freeDeliveryBadge}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4"/>
                        <path d="M21 12c1 0 2-1 2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                        <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                    </svg>
                    <span>Free Delivery!</span>
                </div>
            )}
        </div>
    );
};

export default CartSummary; 