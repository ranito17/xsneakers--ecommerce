import React from 'react';
import styles from './adminOrderCard.module.css';

const AdminOrderCard = ({ 
    order, 
    onViewDetails, 
    onUpdateStatus, 
    onEditOrder 
}) => {
    const {
        id,
        orderNumber,
        customerName,
        customerEmail,
        totalAmount,
        status = 'pending',
        orderDate,
        items = [],
        shippingAddress = {},
        paymentStatus = 'paid'
    } = order;

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return styles.statusPending;
            case 'processing': return styles.statusProcessing;
            case 'shipped': return styles.statusShipped;
            case 'delivered': return styles.statusDelivered;
            case 'cancelled': return styles.statusCancelled;
            default: return styles.statusDefault;
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return styles.paymentPaid;
            case 'pending': return styles.paymentPending;
            case 'failed': return styles.paymentFailed;
            default: return styles.paymentDefault;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAddress = (address) => {
        if (!address || !address.street) return 'No address provided';
        if (address.city && address.state && address.zipCode) {
            return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
        }
        return address.street;
    };

    const getItemsSummary = (items) => {
        if (!items || items.length === 0) return 'No items';
        if (items.length === 1) return items[0].product_name || 'Unknown product';
        return `${items[0].product_name || 'Unknown product'} +${items.length - 1} more`;
    };

    return (
        <div className={styles.orderCard}>
            {/* Order Header */}
            <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                    <div className={styles.orderIdSection}>
                        <h3 className={styles.orderNumber}>{orderNumber}</h3>
                        <span className={styles.orderId}>ID: {id}</span>
                    </div>
                    <div className={styles.customerInfo}>
                        <p className={styles.customerName}>{customerName}</p>
                        <p className={styles.customerEmail}>{customerEmail}</p>
                    </div>
                    <p className={styles.orderDate}>{formatDate(orderDate)}</p>
                </div>
                <div className={styles.orderAmount}>
                    <span className={styles.amount}>${totalAmount.toFixed(2)}</span>
                </div>
            </div>

            {/* Order Details */}
            <div className={styles.orderDetails}>
                <div className={styles.statusSection}>
                    <div className={styles.statusRow}>
                        <span className={styles.statusLabel}>Order Status:</span>
                        <span className={`${styles.status} ${getStatusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    </div>
                    <div className={styles.statusRow}>
                        <span className={styles.statusLabel}>Payment:</span>
                        <span className={`${styles.paymentStatus} ${getPaymentStatusColor(paymentStatus)}`}>
                            {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                        </span>
                    </div>
                </div>
                
                <div className={styles.orderSummary}>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Items:</span>
                        <span className={styles.summaryValue}>{getItemsSummary(items)}</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Address:</span>
                        <span className={styles.summaryValue}>{formatAddress(shippingAddress)}</span>
                    </div>
                </div>
            </div>

            {/* Order Actions */}
            <div className={styles.orderActions}>
                <button
                    onClick={() => onViewDetails(order)}
                    className={styles.actionButton}
                >
                    View Details
                </button>
                
                <select
                    value={status}
                    onChange={(e) => onUpdateStatus(id, e.target.value)}
                    className={styles.statusSelect}
                >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                <button
                    onClick={() => onEditOrder(order)}
                    className={`${styles.actionButton} ${styles.editButton}`}
                >
                    Edit
                </button>

                {/* Delete button removed - financial data must be preserved */}
            </div>
        </div>
    );
};

export default AdminOrderCard; 