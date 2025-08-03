import React from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import styles from './auth.module.css';

const AuthContainer = () => {
    const location = useLocation();
    
    // Determine if we're on signup page
    const isSignup = location.pathname === '/signup';
    
    return (
        <div className={styles.authContainer}>
            <div className={styles.authWrapper}>
                {/* Logo/Brand Section */}
                <div className={styles.brandSection}>
                    <h1 className={styles.brandTitle}>Xsneakers</h1>
                    <p className={styles.brandSubtitle}>
                        {isSignup 
                            ? 'Join the ultimate sneaker community' 
                            : 'Welcome back to your sneaker paradise'
                        }
                    </p>
                </div>
                
                {/* Form Section */}
                <div className={styles.formSection}>
                    {isSignup ? <SignupForm /> : <LoginForm />}
                </div>
                
                {/* Footer */}
                <div className={styles.authFooter}>
                    <p>&copy; 2024 Xsneakers. All rights reserved.</p>
                    <div className={styles.footerLinks}>
                        <a href="/privacy">Privacy Policy</a>
                        <a href="/terms">Terms of Service</a>
                        <a href="/help">Help & Support</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthContainer;
