import React from 'react';
import styles from './orderCard.module.css';

const OrderCard = ({ order, onViewDetails }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return styles.paid;
            case 'pending':
                return styles.pending;
            case 'failed':
                return styles.failed;
            default:
                return styles.pending;
        }
    };

    return (
        <div className={styles.orderCard}>
            <div className={styles.orderHeader}>
                <h2>{order.order_number || `Order #${order.order_id}`}</h2>
                <span className={`${styles.status} ${getStatusColor(order.payment_status)}`}>
                    {order.payment_status}
                </span>
            </div>
            
            <div className={styles.orderInfo}>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Order Date:</span>
                    <span className={styles.value}>{formatDate(order.created_at)}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Estimated Delivery:</span>
                    <span className={styles.value}>{formatDate(order.arrival_estimated_date)}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Total Amount:</span>
                    <span className={styles.totalAmount}>${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
            </div>
            
            <button 
                className={styles.viewDetailsButton}
                onClick={() => onViewDetails(order.order_id)}
            >
                View Details
            </button>
        </div>
    );
};

export default OrderCard; 