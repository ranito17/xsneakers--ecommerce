// UnauthorizedPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './pages.module.css';

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className={styles.aboutUsPage}>
            {/* Hero Section */}
            <div className={styles.aboutHeroSection}>
                <div className={styles.aboutHeroContent}>
                    <div className={styles.aboutMissionIcon}>🚫</div>
                    <h1 className={styles.aboutHeroTitle}>Access Denied</h1>
                    <p className={styles.aboutHeroSubtitle}>
                        Sorry, you don't have permission to access this page. This area is restricted to administrators only.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.aboutMainContent}>
                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>Unauthorized Access</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryText}>
                        <p>
                            You are trying to access an area that requires administrator privileges. 
                            If you believe this is an error, please contact support for assistance.
                        </p>
                        
                        <div className={styles.aboutCtaSection}>
                            <div className={styles.aboutCtaButtons}>
                                <button 
                                    onClick={handleGoBack}
                                    className={styles.aboutCtaButtonPrimary}
                                >
                                    Go Back
                                </button>
                                <button 
                                    onClick={handleGoHome}
                                    className={styles.aboutCtaButtonSecondary}
                                >
                                    Go to Home
                                </button>
                            </div>
                            
                            <p className={styles.aboutCtaText}>
                                Need help? Please{' '}
                                <button 
                                    onClick={() => navigate('/contact')} 
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary-color)',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    contact support
                                </button>
                                {' '}for assistance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage; 