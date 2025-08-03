// frontend/src/components/NavLink/NavLink.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/useCart';
import SideBar from '../sideBar/SideBar';
import styles from './navLinks.module.css';

const NavLinks = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const currentPath = window.location.pathname;
    const { cartCount } = useCart();

    // Close sidebar when component mounts or path changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [currentPath]);

    const isActive = (path) => {
        return currentPath === path;
    };

    return (
        <nav className={styles.navContainer}>
            <div className={styles.navLinks}>
                <a 
                    href="/" 
                    className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
                    aria-current={isActive('/') ? 'page' : undefined}
                >
                    <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9,22 9,12 15,12 15,22"/>
                    </svg>
                    Home
                </a>
                
                <a 
                    href="/products" 
                    className={`${styles.navLink} ${isActive('/products') ? styles.active : ''}`}
                    aria-current={isActive('/products') ? 'page' : undefined}
                >
                    <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    Products
                </a>
                
                <a 
                    href="/cart" 
                    className={`${styles.navLink} ${isActive('/cart') ? styles.active : ''}`}
                    aria-current={isActive('/cart') ? 'page' : undefined}
                >
                    <div className={styles.cartContainer}>
                        <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        {cartCount > 0 && (
                            <span className={styles.cartBadge}>{cartCount}</span>
                        )}
                    </div>
                    Cart
                </a>
                
                <button
                    className={styles.navLink}
                    onClick={() => setIsSidebarOpen(true)}
                    type="button"
                >
                    <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                    Menu
                </button>
            </div>
            <SideBar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </nav>
    );
};

export default NavLinks;