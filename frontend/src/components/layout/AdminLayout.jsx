import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './layout.module.css';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import NavLinks from '../navLinks/NavLinks';

const AdminLayout = () => {
  return (
    <div className={styles.adminLayout}>
      <Header />
      <NavLinks />
      
      {/* Main Content Area */}
      <main className={styles.adminMainContent}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AdminLayout; 