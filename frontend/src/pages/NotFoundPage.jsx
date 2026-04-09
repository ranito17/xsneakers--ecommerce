// NotFoundPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './pages.module.css';

const NotFoundPage = () => {
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
                    <h1 className={styles.aboutHeroTitle}>404</h1>
                    <p className={styles.aboutHeroSubtitle}>
                        Page Not Found
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.aboutMainContent}>
                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>Oops! Page Not Found</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryText}>
                        <p>
                            The page you're looking for doesn't exist. 
                            It might have been moved, deleted, or you entered the wrong URL.
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
                                Need help? Check out our{' '}
                                <button 
                                    onClick={() => navigate('/products')} 
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary-color)',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    products
                                </button>
                                {' '}or{' '}
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
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
