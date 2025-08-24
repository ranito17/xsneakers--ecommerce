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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'processing': return '⚙️';
            case 'shipped': return '📦';
            case 'delivered': return '✅';
            case 'cancelled': return '❌';
            default: return '📊';
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
            <div className={styles.statusIcon}>
                {getStatusIcon(status)}
            </div>
            <div className={styles.statusContent}>
                <h3>{count}</h3>
                <p>{status.charAt(0).toUpperCase() + status.slice(1)}</p>
            </div>
        </div>
    );
};

export default StatusCard;
