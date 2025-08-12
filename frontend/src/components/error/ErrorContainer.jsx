import React from 'react';
import styles from './ErrorContainer.module.css';

const ErrorContainer = ({ message = 'An error occurred', onRetry, showRetry = true }) => {
    return (
        <div className={styles.errorContainer}>
            <div className={styles.errorContent}>
                <div className={styles.errorIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                </div>
                <h3 className={styles.errorTitle}>Oops!</h3>
                <p className={styles.errorMessage}>{message}</p>
                {showRetry && onRetry && (
                    <button className={styles.retryButton} onClick={onRetry}>
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorContainer; 