/**
 * קומפוננטת כרטיס משתמש - UserCard
 * 
 * מציגה כרטיס משתמש עם פרטים בסיסיים
 * מקבלת orderCount כ-prop מהדף העליון (לא עושה API calls בעצמה)
 * 
 * @param {Object} user - אובייקט המשתמש
 * @param {number} orderCount - מספר ההזמנות של המשתמש (מהדף העליון)
 * @param {boolean} loadingOrders - מצב טעינה של מספר ההזמנות
 * @param {Function} onViewCart - פונקציה לצפייה בעגלה
 * @param {Function} onSendMessage - פונקציה לשליחת הודעה
 */
import React, { useState } from 'react';
import { formatUserName, getUserRoleLabel } from '../../../../utils/user.utils';
import { formatDate } from '../../../../utils/date.utils';
import UserModal from '../userModal/UserModal';
import styles from './userCard.module.css';

const UserCard = ({ 
    user, 
    orderCount = 0,
    loadingOrders = false,
    onViewCart, 
    onSendMessage 
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return styles.roleAdmin;
            case 'customer': return styles.roleCustomer;
            default: return styles.roleDefault;
        }
    };

    return (
        <>
            <div className={styles.userCard} onClick={() => setIsModalOpen(true)}>
                {/* User Header */}
                <div className={styles.userHeader}>
                    <h3 className={styles.userName} title={formatUserName(user)}>
                        {formatUserName(user)}
                    </h3>
                    <span className={`${styles.role} ${getRoleColor(user.role)}`}>
                        {getUserRoleLabel(user.role)}
                    </span>
                </div>
                
                {/* User Info */}
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
                        <span className={styles.label}>Orders:</span>
                        <span className={styles.value}>
                            {loadingOrders ? 'Loading...' : orderCount}
                        </span>
                    </div>
                </div>
            </div>

            <UserModal
                isOpen={isModalOpen}
                user={user}
                orderCount={orderCount}
                loadingOrders={loadingOrders}
                onClose={() => setIsModalOpen(false)}
                onViewCart={onViewCart}
                onSendMessage={onSendMessage}
            />
        </>
    );
};

export default UserCard;
