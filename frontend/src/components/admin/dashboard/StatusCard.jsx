import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';

const StatusCard = ({ status, count, onClick }) => {
    const navigate = useNavigate();

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

    const handleClick = () => {
        if (onClick) {
            onClick(status);
        } else {
            // Default navigation to order management with status filter
            navigate('/admin/orders', { state: { statusFilter: status } });
        }
    };

    return (
        <div 
            className={`${styles.statusCard} ${getStatusColor(status)}`}
            onClick={handleClick}
        >
            <div className={styles.statusContent}>
                <div className={styles.statusCount}>{count}</div>
                <div className={styles.statusLabel}>{status.charAt(0).toUpperCase() + status.slice(1)}</div>
            </div>
        </div>
    );
};

export default StatusCard;
