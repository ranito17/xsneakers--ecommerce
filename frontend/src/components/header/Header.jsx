import React from 'react';
import styles from './header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <h1 className={styles.logo}>
                    Xsneakers
                </h1>
            </div>
        </header>
    );
};

export default Header;