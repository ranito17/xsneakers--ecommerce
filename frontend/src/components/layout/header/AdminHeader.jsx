import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuthentication';
import styles from './header.module.css';

const AdminHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path;
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsAdminMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Admin navigation items
    const adminNavItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
        { path: '/admin/products', label: 'Products', icon: '📦' },
        { path: '/admin/categories', label: 'Categories', icon: '🏷️' },
        { path: '/admin/orders', label: 'Orders', icon: '📋' },
        { path: '/admin/users', label: 'Users', icon: '👥' },
        { path: '/admin/activity', label: 'Activity', icon: '📜' }
    ];

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
        setIsAdminMenuOpen(false);
        setIsUserMenuOpen(false);
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.headerContent}>

                    {/* Mobile Nav Toggle — left side on mobile */}
                    <button
                        className={styles.mobileMenuButton}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {isMobileMenuOpen
                                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                            }
                        </svg>
                    </button>

                    {/* Left: Admin Menu Dropdown (desktop only) */}
                    <div className={styles.adminMenuContainer}>
                        <button
                            className={styles.adminMenuButton}
                            onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                            aria-label="Admin menu"
                        >
                            <span className={styles.adminMenuIcon}>📊</span>
                            <span className={styles.adminMenuLabel}>Admin Panel</span>
                            <svg className={styles.dropdownIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6,9 12,15 18,9"></polyline>
                            </svg>
                        </button>

                        {/* Admin Dropdown Menu */}
                        {isAdminMenuOpen && (
                            <div className={styles.adminDropdown}>
                                <div className={styles.adminDropdownHeader}>
                                    <h3>Admin Panel</h3>
                                    <p>Manage your sneaker store</p>
                                </div>
                                <div className={styles.menuItems}>
                                    {adminNavItems.map((item) => (
                                        <button
                                            key={item.path}
                                            className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ''}`}
                                            onClick={() => handleNavigation(item.path)}
                                        >
                                            <span className={styles.menuIcon}>{item.icon}</span>
                                            <span className={styles.menuLabel}>{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

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
                                            <button
                                                className={styles.menuItem}
                                                onClick={() => handleNavigation('/profile')}
                                            >
                                                <span className={styles.menuIcon}>👤</span>
                                                <span className={styles.menuLabel}>Profile</span>
                                            </button>
                                            <button
                                                className={styles.menuItem}
                                                onClick={() => handleNavigation('/admin/messages')}
                                            >
                                                <span className={styles.menuIcon}>✉️</span>
                                                <span className={styles.menuLabel}>Messages</span>
                                            </button>
                                            <button
                                                className={styles.menuItem}
                                                onClick={() => handleNavigation('/admin/settings')}
                                            >
                                                <span className={styles.menuIcon}>⚙️</span>
                                                <span className={styles.menuLabel}>Settings</span>
                                            </button>
                                            <hr className={styles.menuDivider} />
                                            <button
                                                className={styles.menuItem}
                                                onClick={() => handleNavigation('/')}
                                            >
                                                <span className={styles.menuIcon}>🏪</span>
                                                <span className={styles.menuLabel}>View My Store</span>
                                            </button>
                                            <button
                                                className={styles.menuItem}
                                                onClick={handleLogout}
                                            >
                                                <span className={styles.menuIcon}>🚪</span>
                                                <span className={styles.menuLabel}>Logout</span>
                                            </button>
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

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className={styles.mobileNav}>
                        <div className={styles.mobileNavContent}>
                            {adminNavItems.map((item) => (
                                <button
                                    key={item.path}
                                    className={`${styles.mobileNavLink} ${isActive(item.path) ? styles.active : ''}`}
                                    onClick={() => handleNavigation(item.path)}
                                >
                                    <span className={styles.mobileNavIcon}>{item.icon}</span>
                                    <span className={styles.mobileNavLabel}>{item.label}</span>
                                </button>
                            ))}
                            <div className={styles.mobileDivider}></div>
                            <button
                                className={styles.mobileNavLink}
                                onClick={() => handleNavigation('/')}
                            >
                                <span className={styles.mobileNavIcon}>🏪</span>
                                <span className={styles.mobileNavLabel}>View Store</span>
                            </button>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default AdminHeader;
