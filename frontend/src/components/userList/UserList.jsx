import React from 'react';
import UserCard from '../userCard/UserCard';
import styles from './userList.module.css';

const UserList = ({ users, searchTerm }) => {
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
        <div className={styles.userList}>
            {filteredUsers.map(user => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    );
};

export default UserList;
