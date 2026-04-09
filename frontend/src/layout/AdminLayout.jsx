import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminHeader, Footer } from '../components/layout';
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