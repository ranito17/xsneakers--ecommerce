import React from 'react';
import UserCard from '../userCard/UserCard';
import styles from './userList.module.css';

/**
 * קומפוננטת רשימת משתמשים - UserList
 * 
 * מציגה רשימת משתמשים ומעבירה props ל-UserCard
 * 
 * @param {Array} users - מערך של משתמשים
 * @param {string} searchTerm - מונח חיפוש
 * @param {Object} userOrderCounts - אובייקט של userId -> orderCount
 * @param {Object} loadingOrderCounts - אובייקט של userId -> loading state
 * @param {Function} onViewCart - פונקציה לצפייה בעגלה
 * @param {Function} onSendMessage - פונקציה לשליחת הודעה
 */
const UserList = ({ 
    users, 
    searchTerm, 
    userOrderCounts = {},
    loadingOrderCounts = {},
    onViewCart, 
    onSendMessage 
}) => {
    // Filter users based on search term
    const filteredUsers = users.filter(user => {
        if (!searchTerm || searchTerm.trim() === '') {
            return true;
        }
        
        const searchLower = searchTerm.toLowerCase();
        return (
            user.full_name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        );
    });

    if (filteredUsers.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👥</div>
                <h3 className={styles.emptyTitle}>
                    {searchTerm ? 'No users found' : 'No users available'}
                </h3>
                <p className={styles.emptyMessage}>
                    {searchTerm 
                        ? `No users match "${searchTerm}". Try a different search term.`
                        : 'There are no users in the system yet.'
                    }
                </p>
            </div>
        );
    }

    return (
        <div className={styles.userListContainer}>
            <div className={styles.usersGrid}>
                {filteredUsers.map(user => (
                    <UserCard 
                        key={user.id} 
                        user={user}
                        orderCount={userOrderCounts[user.id] || 0}
                        loadingOrders={loadingOrderCounts[user.id] || false}
                        onViewCart={onViewCart}
                        onSendMessage={onSendMessage}
                    />
                ))}
            </div>
        </div>
    );
};

export default UserList;
