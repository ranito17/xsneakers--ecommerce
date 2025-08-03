import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UnauthorizedPage.module.css';

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.icon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                </div>
                
                <h1 className={styles.title}>Access Denied</h1>
                <p className={styles.message}>
                    Sorry, you don't have permission to access this page. 
                    This area is restricted to administrators only.
                </p>
                
                <div className={styles.actions}>
                    <button onClick={handleGoBack} className={styles.backButton}>
                        Go Back
                    </button>
                    <button onClick={handleGoHome} className={styles.homeButton}>
                        Go to Home
                    </button>
                </div>
                
                <div className={styles.help}>
                    <p>If you believe this is an error, please contact support.</p>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage; 