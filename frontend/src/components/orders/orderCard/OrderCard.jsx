import React from 'react';
import { useSettings } from '../../../context/SettingsProvider';
import { formatDate } from '../../../utils/date.utils';
import { formatOrderTotal } from '../../../utils/order.utils';
import styles from './orderCard.module.css';

const OrderCard = ({ order, onViewDetails, onDownloadReceipt }) => {
    const { settings } = useSettings();
    const currency = settings?.currency || 'ILS';
    
    const handleCardClick = () => {
        if (onViewDetails) {
            onViewDetails(order.order_id);
        }
    };

    const handleDownloadClick = (e) => {
        e.stopPropagation();
        if (onDownloadReceipt) {
            onDownloadReceipt(order.order_id);
        }
    };

    return (
        <div 
            className={styles.orderCard} 
            id={`order-${order.order_id}`}
            onClick={handleCardClick}
            style={{ cursor: 'pointer' }}
        >
            <div className={styles.orderHeader}>
                <h2>{order.order_number || `Order #${order.order_id}`}</h2>
            </div>
            
            <div className={styles.orderInfo}>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Order Date:</span>
                    <span className={styles.value}>{formatDate(order.created_at)}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Status:</span>
                    <span className={styles.value}>{order.status || 'N/A'}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Estimated Delivery:</span>
                    <span className={styles.value}>{formatDate(order.arrival_date_estimated)}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Total Amount:</span>
                    <span className={styles.totalAmount}>{formatOrderTotal(order.total_amount, currency)}</span>
                </div>
            </div>
            
            <div className={styles.buttonGroup}>
                {onDownloadReceipt && (
                    <button 
                        className={styles.downloadReceiptButton}
                        onClick={handleDownloadClick}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download Receipt
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderCard; 