
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthentication';
import styles from './sideBar.module.css';

const SideBar = ({ isOpen, onClose, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [isClosing, setIsClosing] = useState(false);

    // Handle sidebar close with animation
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    // Close sidebar when route changes
    useEffect(() => {
        if (isOpen) {
            handleClose();
        }
    }, [location.pathname]);

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
            console.error('Logout error:', error);
            // Still navigate to home even if logout fails
            handleClose();
            navigate('/');
        }
    };

    // Admin navigation options
    const adminOptions = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
        {id:'analytics',label:'Analytics',icon:'📈',path:'/admin/analytics'},
        { id: 'products', label: 'Products', icon: '📦', path: '/admin/products' },
        { id: 'orders', label: 'Orders', icon: '📋', path: '/admin/orders' },
        { id: 'users', label: 'Users', icon: '👥', path: '/admin/users' },
        { id: 'settings', label: 'Settings', icon: '⚙️', path: '/admin/settings' },
        { id: 'logout', label: 'Logout', icon: '🚪', action: handleLogout }
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* Hamburger Menu Button - Only show when sidebar is closed */}
            {!isOpen && (
                <button
                    className={styles.sidebarToggle}
                    onClick={onToggle}
                    aria-label="Toggle admin panel"
                >
                    <div className={styles.hamburger}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span>Admin Panel</span>
                </button>
            )}

            {/* Sidebar */}
            <div className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${isClosing ? styles.closing : ''}`}>
                {/* Close Button */}
                {/* Navigation Menu */}
                <nav className={styles.navigation}>
                    <div className={styles.navHeader}>
                        <button 
                            className={styles.closeButton}
                            onClick={handleClose}
                            aria-label="Close sidebar"
                        >
                            ✕
                        </button>
                        <h2>Admin Panel</h2>
                     
                    </div>
                    
                    <ul className={styles.navList}>
                        {adminOptions.map((option) => (
                            <li key={option.id} className={styles.navItem}>
                                <button
                                    className={`${styles.navButton} ${option.path && isActive(option.path) ? styles.active : ''}`}
                                    onClick={option.action || (() => handleNavigation(option.path))}
                                    aria-label={option.label}
                                >
                                    <span className={styles.navIcon}>{option.icon}</span>
                                    <span className={styles.navLabel}>{option.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default SideBar;