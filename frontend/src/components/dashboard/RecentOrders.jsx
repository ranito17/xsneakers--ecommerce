import React from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../services/orderApi';
import styles from './dashboard.module.css';

const RecentOrders = ({ orders = [], onOrderClick }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleOrderClick = async (order) => {
        if (onOrderClick) {
            onOrderClick(order);
        }
    };

    const handleViewAllOrders = () => {
        navigate('/admin/orders');
    };

    if (orders.length === 0) {
        return (
            <div className={styles.recentOrdersCard}>
                <div className={styles.cardHeader}>
                    <h2>Recent Orders</h2>
                    <button 
                        className={styles.viewAllButton}
                        onClick={handleViewAllOrders}
                    >
                        VIEW ALL
                    </button>
                </div>
                <div className={styles.emptyState}>
                    <p>No orders yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.recentOrdersCard}>
            <div className={styles.cardHeader}>
                <h2>Recent Orders</h2>
                <button 
                    className={styles.viewAllButton}
                    onClick={handleViewAllOrders}
                >
                    VIEW ALL
                </button>
            </div>
            <div className={styles.ordersList}>
                {orders.map(order => (
                    <div 
                        key={order.order_id} 
                        className={styles.orderItem}
                        onClick={() => handleOrderClick(order)}
                    >
                        {/* Top Row - Order ID, Date, Amount */}
                        <div className={styles.orderTopRow}>
                            <div className={styles.orderIdSection}>
                                <span className={styles.orderNumber}>
                                    {order.order_number}
                                </span>
                            </div>
                            <div className={styles.orderDateSection}>
                                <span className={styles.orderDate}>
                                    {formatDate(order.created_at)}
                                </span>
                            </div>
                            <div className={styles.orderAmountSection}>
                                <span className={styles.amount}>
                                    ${parseFloat(order.total_amount).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        
                        {/* Bottom Row - Customer Info and Status */}
                        <div className={styles.orderBottomRow}>
                            <div className={styles.customerInfo}>
                                <span className={styles.customerName}>
                                    {order.customer_name}
                                </span>
                                <span className={styles.customerEmail}>
                                    {order.customer_email}
                                </span>
                            </div>
                            <div className={styles.orderStatus}>
                                <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper function for status colors
const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return styles.statusPending;
        case 'processing':
            return styles.statusProcessing;
        case 'shipped':
            return styles.statusShipped;
        case 'delivered':
            return styles.statusDelivered;
        case 'cancelled':
            return styles.statusCancelled;
        default:
            return styles.statusDefault;
    }
};

export default RecentOrders;
