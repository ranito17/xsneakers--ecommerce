import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/common/toast';
import { getAllUsers, userApi } from '../../services/userApi';
import { UserList, UserCartModal } from '../../components/admin/users';
import { LoadingContainer } from '../../components/contactForm';
import ContactFormModal from '../../components/contactForm/ContactFormModal';
import { messageApi } from '../../services/messageApi';
import SearchBar from '../../components/admin/common/SearchBar';
import ProtectedRoute from '../../components/ProtectedRoute';
import useAuthorization from '../../hooks/useAuthorization';
import styles from './adminPages.module.css';

const UserManagementPage = () => {
    const { showError, showSuccess, showConfirmation } = useToast();
    const [users, setUsers] = useState([]);
    const [userOrderCounts, setUserOrderCounts] = useState({});
    const [loadingOrderCounts, setLoadingOrderCounts] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');
    const [showCartModal, setShowCartModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userCart, setUserCart] = useState(null);
    const [loadingCart, setLoadingCart] = useState(false);
    
    const { isAuthorized, isLoading } = useAuthorization('admin');
    
    useEffect(() => {
        if (isAuthorized && !isLoading) {
            fetchUsers();
        }
    }, [isAuthorized, isLoading]);

    // If still loading auth, show loading
    if (isLoading) {
        return <LoadingContainer message="Loading..." size="large" />;
    }
    
    // If not authorized, don't execute any component logic
    if (!isAuthorized) {
        return <ProtectedRoute requiredRole="admin"><div /></ProtectedRoute>;
    }

    // fetchUsers - טוען את כל המשתמשים מהשרת
    // שליחה לשרת: getAllUsers()
    // תגובה מהשרת: { data: [...] }
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllUsers();
            const usersData = response.data || [];
            setUsers(usersData);
            await fetchAllUserOrderCounts(usersData);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    // fetchAllUserOrderCounts - טוען את מספר ההזמנות לכל משתמש
    // NOTE: order count endpoint is currently available only for the authenticated user.
    // To avoid calling a non-existent route, we default counts to 0 here.
    const fetchAllUserOrderCounts = async (usersList) => {
        const counts = {};
        const loadingStates = {};

        usersList.forEach(user => {
            loadingStates[user.id] = true;
            counts[user.id] = 0;
        });

        setUserOrderCounts(counts);
        setLoadingOrderCounts(loadingStates);

        await Promise.all(usersList.map(async (user) => {
            try {
                const response = await userApi.getUserOrderCount(user.id);
                counts[user.id] = response?.data ?? 0;
            } catch (err) {
                console.error(`Error fetching order count for user ${user.id}:`, err);
                counts[user.id] = 0;
            } finally {
                loadingStates[user.id] = false;
                setLoadingOrderCounts({ ...loadingStates });
                setUserOrderCounts({ ...counts });
            }
        }));
    };


    // handleViewCart - טוען עגלת קניות של משתמש ופותח מודל
    // שליחה לשרת: getUserCart(userId)
    // תגובה מהשרת: { success: true, data: {...} }
    const handleViewCart = async (user) => {
        try {
            setSelectedUser(user);
            setLoadingCart(true);
            setShowCartModal(true);
            const response = await userApi.getUserCart(user.id);
            if (response.success) {
                setUserCart(response.data);
            }
        } catch (error) {
            console.error('Error fetching user cart:', error);
            showError('Failed to load user cart. Please try again.');
            setShowCartModal(false);
        } finally {
            setLoadingCart(false);
        }
    };


    // handleSendMessage - פותח מודל שליחת הודעה למשתמש
    const handleSendMessage = (user) => {
        setSelectedUser(user);
        setShowMessageModal(true);
    };


    // handleMessageSubmit - שולח הודעה למשתמש
    // שליחה לשרת: sendMessage({ subject, message, recipientEmail, messageType })
    // תגובה מהשרת: { success: true }
    const handleMessageSubmit = async (formData) => {
        try {
            await messageApi.sendMessage({
                subject: formData.subject,
                message: formData.message,
                recipientEmail: selectedUser.email,
                messageType: 'reply'
            });
            showSuccess(`Message sent successfully to ${selectedUser.full_name}!`);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };


    // handleCloseCartModal - סוגר מודל עגלת קניות
    const handleCloseCartModal = () => {
        setShowCartModal(false);
        setSelectedUser(null);
        setUserCart(null);
    };


    // handleCloseMessageModal - סוגר מודל שליחת הודעה
    const handleCloseMessageModal = () => {
        setShowMessageModal(false);
        setSelectedUser(null);
    };


    // handleSearchChange - מעדכן את מילת החיפוש
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };


    // handleClearSearch - מנקה את מילת החיפוש
    const handleClearSearch = () => {
        setSearchTerm('');
    };


    // handleSortChange - משנה את כיוון המיון
    const handleSortChange = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };


    const getSortedUsers = (userList) => {
        return [...userList].sort((a, b) => {
            const aValue = new Date(a.created_at || 0);
            const bValue = new Date(b.created_at || 0);
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };
    const filteredUsers = users.filter(user => {
        if (!searchTerm || searchTerm.trim() === '') return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            user.full_name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        );
    });
    const sortedUsers = getSortedUsers(filteredUsers);
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
    return (
        <div className={styles.userManagement}>
            <div className={styles.userMainContent}>
            <div className={styles.userFilterInfo}>
                <SearchBar
                    count={filteredUsers.length}
                    totalCount={users.length}
                    itemName="user"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onClear={handleClearSearch}
                />
                <div className={styles.userControlsRight}>
                    <div className={styles.sortSection}>
                        <span className={styles.sortLabel}>Sort by:</span>
                        <div className={styles.sortButtons}>
                            <button
                                className={`${styles.sortButton} ${styles.active}`}
                                onClick={handleSortChange}
                            >
                                Date Joined {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.contentSection}>
                <UserList 
                    users={sortedUsers} 
                    searchTerm={searchTerm}
                    userOrderCounts={userOrderCounts}
                    loadingOrderCounts={loadingOrderCounts}
                    onViewCart={handleViewCart}
                    onSendMessage={handleSendMessage}
                />
            </div>
            <>
                <UserCartModal
                    isOpen={showCartModal}
                    onClose={handleCloseCartModal}
                    cart={userCart}
                    userName={selectedUser?.full_name || ''}
                    loading={loadingCart}
                />
                <ContactFormModal
                    isOpen={showMessageModal}
                    onClose={handleCloseMessageModal}
                    onSubmit={handleMessageSubmit}
                    type="reply"
                    initialData={{
                        recipientEmail: selectedUser?.email || '',
                        subject: '',
                        message: ''
                    }}
                />
            </>
            </div>
        </div>
    );
};

export default UserManagementPage;
