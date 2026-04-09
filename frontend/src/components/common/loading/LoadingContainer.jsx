import React from 'react';
import styles from './LoadingContainer.module.css';

const LoadingContainer = ({ message = 'Loading...', size = 'medium' }) => {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.loadingContent}>
                <div className={`${styles.spinner} ${styles[size]}`}>
                    <div className={styles.spinnerRing}></div>
                </div>
                <p className={styles.loadingMessage}>{message}</p>
            </div>
        </div>
    );
};

export default LoadingContainer; 