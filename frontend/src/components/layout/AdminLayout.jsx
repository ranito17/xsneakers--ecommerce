import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../header/AdminHeader';
import Footer from '../footer/Footer';
import styles from './layout.module.css';

const AdminLayout = () => {
    return (
        <div className={styles.layout}>
            <AdminHeader />
            <main className={styles.main}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default AdminLayout; 