import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminHeader from '../header/AdminHeader';
import Footer from '../footer/Footer';
import styles from './layout.module.css';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar when route changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className={styles.layout}>
            <AdminHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <main className={`${styles.main} ${isSidebarOpen ? styles.mainWithSidebar : ''}`}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default AdminLayout; 