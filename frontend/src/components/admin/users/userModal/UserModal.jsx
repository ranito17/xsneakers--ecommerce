/**
 * מודל פרטי משתמש - UserModal
 * 
 * מציג מודל עם פרטים מלאים של משתמש
 * 
 * @param {boolean} isOpen - האם המודל פתוח
 * @param {Object} user - אובייקט המשתמש
 * @param {number} orderCount - מספר ההזמנות של המשתמש
 * @param {boolean} loadingOrders - מצב טעינה של מספר ההזמנות
 * @param {Function} onClose - פונקציה לסגירת המודל
 * @param {Function} onViewCart - פונקציה לצפייה בעגלה
 * @param {Function} onSendMessage - פונקציה לשליחת הודעה
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatAddress, formatUserName, getUserRoleLabel } from '../../../../utils/user.utils';
import { formatDate } from '../../../../utils/date.utils';
import { userApi } from '../../../../services/userApi';
import styles from './userModal.module.css';

const UserModal = ({ 
    isOpen, 
    user, 
    orderCount, 
    loadingOrders,
    onClose, 
    onViewCart, 
    onSendMessage 
}) => {
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0);
    const [loadingCart, setLoadingCart] = useState(false);

    // Load cart when modal opens
    useEffect(() => {
        if (isOpen && user?.id) {
            loadCartCount();
        } else {
            setCartCount(0);
        }
    }, [isOpen, user?.id]);

    const loadCartCount = async () => {
        if (!user?.id) return;
        try {
            setLoadingCart(true);
            const response = await userApi.getUserCart(user.id);
            if (response.success && response.data?.items) {
                const count = response.data.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                setCartCount(count);
            } else {
                setCartCount(0);
            }
        } catch (error) {
            console.error('Error loading cart count:', error);
            setCartCount(0);
        } finally {
            setLoadingCart(false);
        }
    };

    if (!isOpen || !user) return null;

    const handleViewOrders = () => {
        navigate('/admin/orders', { 
            state: { 
                userFilter: {
                    userId: user.id,
                    userEmail: user.email
                }
            }
        });
        onClose();
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return styles.roleAdmin;
            case 'customer': return styles.roleCustomer;
            default: return styles.roleDefault;
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>User Details</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.userHeader}>
                        <h3 className={styles.userName}>{formatUserName(user)}</h3>
                        <span className={`${styles.role} ${getRoleColor(user.role)}`}>
                            {getUserRoleLabel(user.role)}
                        </span>
                    </div>

                    <div className={styles.userInfo}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Email:</span>
                            <span className={styles.value}>{user.email || 'N/A'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Phone:</span>
                            <span className={styles.value}>{user.phone_number || 'No number registered'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Joined:</span>
                            <span className={styles.value}>{formatDate(user.created_at, 'short')}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Address:</span>
                            <span className={styles.value} title={formatAddress(user.address)}>
                                {formatAddress(user.address, 'short')}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Orders:</span>
                            <span className={styles.value}>
                                {loadingOrders ? 'Loading...' : orderCount}
                            </span>
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button
                            onClick={handleViewOrders}
                            className={styles.viewOrdersButton}
                            disabled={loadingOrders}
                        >
                            📦 Orders ({orderCount})
                        </button>
                        <button
                            onClick={() => {
                                onViewCart(user);
                                onClose();
                            }}
                            className={styles.cartButton}
                            disabled={loadingCart}
                        >
                            🛒 Cart {cartCount > 0 && `(${cartCount})`}
                        </button>
                        <button
                            onClick={() => {
                                onSendMessage(user);
                                onClose();
                            }}
                            className={styles.messageButton}
                        >
                            💬 Message
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserModal;

