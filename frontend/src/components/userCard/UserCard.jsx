import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './userCard.module.css';

const UserCard = ({ user }) => {
    const navigate = useNavigate();

    const handleViewOrders = () => {
        // Navigate to order management page with user filter
        navigate('/admin/orders', { 
            state: { 
                userFilter: {
                    userId: user.id,
                    userEmail: user.email
                }
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className={styles.userCard}>
            <div className={styles.userInfo}>
                <div className={styles.userHeader}>
                    <h3 className={styles.userName}>{user.full_name}</h3>
                    <span className={`${styles.userRole} ${styles[user.role]}`}>
                        {user.role}
                    </span>
                </div>
                
                <div className={styles.userDetails}>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Email:</span>
                        <span className={styles.value}>{user.email}</span>
                    </div>
                    
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Phone:</span>
                        <span className={styles.value}>
                            {user.phone_number || 'N/A'}
                        </span>
                    </div>
                    
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Address:</span>
                        <span className={styles.value}>
                            {user.address || 'N/A'}
                        </span>
                    </div>
                    
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Joined:</span>
                        <span className={styles.value}>
                            {formatDate(user.created_at)}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className={styles.userActions}>
                <button 
                    className={styles.viewOrdersBtn}
                    onClick={handleViewOrders}
                >
                    View Orders
                </button>
            </div>
        </div>
    );
};

export default UserCard;
