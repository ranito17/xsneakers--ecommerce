import React from 'react';
import styles from './footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <p className={styles.copyright}>
                    All rights reserved © Rani Tobassy & Shady Ghadban 2025 49/1
                </p>
            </div>
        </footer>
    );
};

export default Footer;