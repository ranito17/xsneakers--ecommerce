import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import NavLinks from '../navLinks/NavLinks';
import styles from './layout.module.css';

const PagesLayout = () => {
  return (
    <div className={styles.layout}>
      {/* Header */}
      <Header />
      
      {/* Navigation */}
      <NavLinks />
      
      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PagesLayout; 