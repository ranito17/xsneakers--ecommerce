import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/userApi';
import UserList from '../../components/userList/UserList';
import LoadingContainer from '../../components/loading/LoadingContainer';
import styles from './adminPages.module.css';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllUsers();
            setUsers(response.data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    if (loading) {
        return <LoadingContainer />;
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorContent}>
                    <h2>Error Loading Users</h2>
                    <p>{error}</p>
                    <button 
                        className={styles.retryButton}
                        onClick={fetchUsers}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const filteredUsersCount = users.filter(user => {
        if (!searchTerm || searchTerm.trim() === '') return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            user.full_name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        );
    }).length;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div className={styles.headerContent}>
                    <h1 className={styles.pageTitle}>User Management</h1>
                    <p className={styles.pageSubtitle}>
                        Manage and view all registered users
                    </p>
                </div>
                
                <div className={styles.headerStats}>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{users.length}</span>
                        <span className={styles.statLabel}>Total Users</span>
                    </div>
                    {searchTerm && (
                        <div className={styles.statCard}>
                            <span className={styles.statNumber}>{filteredUsersCount}</span>
                            <span className={styles.statLabel}>Filtered Results</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <div className={styles.searchInputWrapper}>
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className={styles.searchInput}
                        />
                        {searchTerm && (
                            <button
                                onClick={handleClearSearch}
                                className={styles.clearSearchBtn}
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.contentSection}>
                <UserList users={users} searchTerm={searchTerm} />
            </div>
        </div>
    );
};

export default UserManagementPage;
