
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import styles from './sideBar.module.css';

const SideBar = ({ isOpen, onClose }) => {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [isClosing, setIsClosing] = useState(false);

    // Handle sidebar close with animation
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    // Close sidebar when authentication state changes
    useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
        }
    }, [isOpen, isAuthenticated]);

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest(`.${styles.sidebar}`) && !event.target.closest(`.${styles.sidebarToggle}`)) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Navigation functions
    const handleNavigation = (path) => {
        handleClose();
        navigate(path);
    };

    const handleLogout = async () => {
        try {
            await logout();
            handleClose();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Admin navigation options (Simplified)
    const adminOptions = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', action: () => handleNavigation('/dashboard') },
        { id: 'products', label: 'Products', icon: '📦', action: () => handleNavigation('/admin/products') },
        { id: 'orders', label: 'Orders', icon: '📋', action: () => handleNavigation('/admin/orders') },
        { id: 'settings', label: 'Settings', icon: '⚙️', action: () => handleNavigation('/admin/settings') },
        { id: 'logout', label: 'Logout', icon: '🚪', action: handleLogout }
    ];

    // Customer navigation options (Simplified)
    const customerOptions = [
        { id: 'orders', label: 'My Orders', icon: '📋', action: () => handleNavigation('/orderPage') },
        { id: 'wishlist', label: 'Wishlist', icon: '❤️', action: () => handleNavigation('/wishlist') },
        { id: 'help', label: 'Help & Support', icon: '❓', action: () => handleNavigation('/help') },
        { id: 'logout', label: 'Logout', icon: '🚪', action: handleLogout }
    ];

    // Guest navigation options
    const guestOptions = [
        { id: 'login', label: 'Login', icon: '🔑', action: () => handleNavigation('/login') },
        { id: 'signup', label: 'Sign Up', icon: '📝', action: () => handleNavigation('/signup') },
        { id: 'about', label: 'About Us', icon: 'ℹ️', action: () => handleNavigation('/about') },
        { id: 'contact', label: 'Contact', icon: '📞', action: () => handleNavigation('/contact') }
    ];

    // Get current user options
    const getCurrentOptions = () => {
        if (isLoading) return guestOptions; // Show guest options while loading
        if (!isAuthenticated) return guestOptions;
        if (user?.role === 'admin') return adminOptions;
        return customerOptions;
    };

    const currentOptions = getCurrentOptions();

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className={`${styles.backdrop} ${isClosing ? styles.fadeOut : styles.fadeIn}`}
                    onClick={handleClose}
                />
            )}

            {/* Sidebar */}
            <div className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isClosing ? styles.closing : ''}`}>
                {/* Header */}
                <div className={styles.sidebarHeader}>
                    <div className={styles.userInfo}>
                        {isLoading ? (
                            <>
                                <div className={styles.userAvatar}>⏳</div>
                                <div className={styles.userDetails}>
                                    <h3>Loading...</h3>
                                    <p>Please wait</p>
                                </div>
                            </>
                        ) : isAuthenticated ? (
                            <>
                                <div className={styles.userAvatar}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className={styles.userDetails}>
                                    <h3>{user?.name || 'User'}</h3>
                                    <p>{user?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles.userAvatar}>👤</div>
                                <div className={styles.userDetails}>
                                    <h3>Guest User</h3>
                                    <p>Please login to continue</p>
                                </div>
                            </>
                        )}
                    </div>
                    <button 
                        className={styles.closeButton}
                        onClick={handleClose}
                        aria-label="Close sidebar"
                    >
                        ✕
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className={styles.navigation}>
                    <ul className={styles.navList}>
                        {currentOptions.map((option) => (
                            <li key={option.id} className={styles.navItem}>
                                <button
                                    className={styles.navButton}
                                    onClick={option.action}
                                    aria-label={option.label}
                                >
                                    <span className={styles.navIcon}>{option.icon}</span>
                                    <span className={styles.navLabel}>{option.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className={styles.sidebarFooter}>
                    <div className={styles.footerInfo}>
                        <p>© 2024 Xsneakers</p>
                        <p>Version 1.0.0</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SideBar;