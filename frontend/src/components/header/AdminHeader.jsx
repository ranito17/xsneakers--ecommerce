import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthentication';
import SideBar from '../sideBar/SideBar';
import styles from './header.module.css';

const AdminHeader = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, isLoading } = useAuth();

    // Close mobile menu when route changes
    useEffect(() => {
        // This is now handled by the sidebar component
    }, [location.pathname]);

    const isActive = (path) => {
        return location.pathname === path;
    };

    // Admin navigation items (now handled by sidebar)
    const adminNavItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/products', label: 'Products', icon: '📦' },
        { path: '/admin/orders', label: 'Orders', icon: '📋' },
        { path: '/admin/settings', label: 'Settings', icon: '⚙️' }
    ];

    return (
        <>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    {/* Left: Sidebar Toggle */}
                    <div className={styles.sidebarToggleSection}>
                        <SideBar 
                            isOpen={isSidebarOpen} 
                            onClose={() => setIsSidebarOpen(false)}
                            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        />
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
                            <div className={styles.userInfo}>
                                <div className={styles.userAvatar}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </div>
                                <span className={styles.userName}>{user?.name || 'Admin'}</span>
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
        </>
    );
};

export default AdminHeader;
