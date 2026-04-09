import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import styles from './layout.module.css';

const PagesLayout = () => {
    return (
        <div >
            <Header />
            <main className={styles.main}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PagesLayout; 