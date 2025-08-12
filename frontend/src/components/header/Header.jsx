import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthentication';
import { useCart } from '../../hooks/useCart';
import styles from './header.module.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const { cartCount } = useCart();
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

    // Navigation items
    const navItems = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/products', label: 'Products', icon: '📦' },
        { path: '/cart', label: 'Cart', icon: '🛒', badge: cartCount },
        { path: '/contact', label: 'Contact', icon: '📧' }
    ];

    // User menu items based on role
    const getUserMenuItems = () => {
        if (!isAuthenticated) {
            return [
                { label: 'Login', icon: '🔑', action: () => navigate('/login') },
                { label: 'Sign Up', icon: '📝', action: () => navigate('/signup') }
            ];
        }

        if (user?.role === 'admin') {
            return [
                { label: 'Dashboard', icon: '📊', action: () => navigate('/admin/dashboard') },
                { label: 'Products', icon: '📦', action: () => navigate('/admin/products') },
                { label: 'Orders', icon: '📋', action: () => navigate('/admin/orders') },
                { label: 'Settings', icon: '⚙️', action: () => navigate('/admin/settings') },
                { type: 'divider' },
                { label: 'Logout', icon: '🚪', action: handleLogout }
            ];
        }

        return [
            { label: 'My Orders', icon: '📋', action: () => navigate('/orderPage') },
            { label: 'Profile', icon: '👤', action: () => navigate('/profile') },
            { type: 'divider' },
            { label: 'Logout', icon: '🚪', action: handleLogout }
        ];
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                {/* Left: Navigation Links */}
                <nav className={styles.desktopNav}>
                    {navItems.map((item) => (
                        <a
                            key={item.path}
                            href={item.path}
                            className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span className={styles.navLabel}>{item.label}</span>
                            {item.badge && item.badge > 0 && (
                                <span className={styles.badge}>{item.badge}</span>
                            )}
                        </a>
                    ))}
                </nav>

                {/* Center: Logo */}
                <div className={styles.logoSection}>
                    <h1 className={styles.logo} onClick={() => navigate('/')}>
                        Xsneakers
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
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className={styles.userName}>{user?.name || 'User'}</span>
                                <svg className={styles.dropdownIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                </svg>
                            </button>

                            {/* User Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className={styles.userDropdown}>
                                    <div className={styles.userInfo}>
                                        <div className={styles.userAvatar}>
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className={styles.userDetails}>
                                            <h4>{user?.name || 'User'}</h4>
                                            <p>{user?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                                        </div>
                                    </div>
                                    <div className={styles.menuItems}>
                                        {getUserMenuItems().map((item, index) => (
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

                    {/* Mobile Menu Button */}
                    <button
                        className={styles.mobileMenuButton}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className={styles.mobileNav}>
                    <div className={styles.mobileNavContent}>
                        {navItems.map((item) => (
                            <a
                                key={item.path}
                                href={item.path}
                                className={`${styles.mobileNavLink} ${isActive(item.path) ? styles.active : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className={styles.mobileNavIcon}>{item.icon}</span>
                                <span className={styles.mobileNavLabel}>{item.label}</span>
                                {item.badge && item.badge > 0 && (
                                    <span className={styles.mobileBadge}>{item.badge}</span>
                                )}
                            </a>
                        ))}
                        
                        {isAuthenticated && (
                            <div className={styles.mobileUserSection}>
                                <hr className={styles.mobileDivider} />
                                {getUserMenuItems().map((item, index) => (
                                    <div key={index}>
                                        {item.type === 'divider' ? (
                                            <hr className={styles.mobileDivider} />
                                        ) : (
                                            <button
                                                className={styles.mobileMenuItem}
                                                onClick={() => {
                                                    item.action();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                <span className={styles.mobileMenuIcon}>{item.icon}</span>
                                                <span className={styles.mobileMenuLabel}>{item.label}</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;