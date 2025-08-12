import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthentication';
import styles from './header.module.css';

const AdminHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    // Admin navigation items
    const adminNavItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/products', label: 'Products', icon: '📦' },
        { path: '/admin/orders', label: 'Orders', icon: '📋' },
        { path: '/admin/settings', label: 'Settings', icon: '⚙️' }
    ];

    // Admin user menu items
    const getAdminMenuItems = () => {
        if (!isAuthenticated) {
            return [
                { label: 'Login', icon: '🔑', action: () => navigate('/login') },
                { label: 'Sign Up', icon: '📝', action: () => navigate('/signup') }
            ];
        }

        return [
            { label: 'Dashboard', icon: '📊', action: () => navigate('/admin/dashboard') },
            { label: 'Products', icon: '📦', action: () => navigate('/admin/products') },
            { label: 'Orders', icon: '📋', action: () => navigate('/admin/orders') },
            { label: 'Settings', icon: '⚙️', action: () => navigate('/admin/settings') },
            { type: 'divider' },
            { label: 'Logout', icon: '🚪', action: handleLogout }
        ];
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                {/* Left: Empty space for balance */}
                <div className={styles.desktopNav}></div>

                {/* Center: Logo */}
                <div className={styles.logoSection}>
                    <h1 className={styles.logo} onClick={() => navigate('/admin/dashboard')}>
                        Xsneakers Admin
                    </h1>
                </div>

                {/* Right: User Section */}
                <div className={styles.userSection}>
                    {isLoading ? (
                        <div className={styles.loadingUser}>
                            <div className={styles.spinner}></div>
                        </div>
                    ) : isAuthenticated ? (
                        <div className={styles.userMenuContainer}>
                            <button
                                className={styles.userButton}
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                aria-label="User menu"
                            >
                                <div className={styles.userAvatar}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </div>
                                <span className={styles.userName}>{user?.name || 'Admin'}</span>
                                <svg className={styles.dropdownIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                </svg>
                            </button>

                            {/* User Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className={styles.userDropdown}>
                                    <div className={styles.userInfo}>
                                        <div className={styles.userAvatar}>
                                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                        <div className={styles.userDetails}>
                                            <h4>{user?.name || 'Admin'}</h4>
                                            <p>Administrator</p>
                                        </div>
                                    </div>
                                    <div className={styles.menuItems}>
                                        {getAdminMenuItems().map((item, index) => (
                                            <div key={index}>
                                                {item.type === 'divider' ? (
                                                    <hr className={styles.menuDivider} />
                                                ) : (
                                                    <button
                                                        className={styles.menuItem}
                                                        onClick={() => {
                                                            item.action();
                                                            setIsUserMenuOpen(false);
                                                        }}
                                                    >
                                                        <span className={styles.menuIcon}>{item.icon}</span>
                                                        <span className={styles.menuLabel}>{item.label}</span>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.authButtons}>
                            <button
                                className={styles.authButton}
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </button>
                            <button
                                className={`${styles.authButton} ${styles.primary}`}
                                onClick={() => navigate('/signup')}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
