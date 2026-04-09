import React from 'react';
import styles from './auth.module.css';

const ForgotPasswordForm = ({ 
    email, 
    emailError, 
    isLoading, 
    onChange, 
    onSubmit, 
    onBackToLogin 
}) => {
    return (
        <div className={styles.authForm}>
            <div className={styles.authFormHeader}>
                <h2>Forgot Password</h2>
                <p className={styles.subtitle}>
                    Enter your email address and we'll send you a reset code.
                </p>
            </div>

            <form onSubmit={onSubmit} className={styles.loginFormContent}>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="Enter your email address"
                        disabled={isLoading}
                        required
                        className={emailError ? styles.errorInput : ''}
                    />
                    {emailError && <span className={styles.error}>{emailError}</span>}
                </div>

                <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isLoading || !email || emailError}
                >
                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
            </form>
            
            {/* Navigation Links */}
            <div className={styles.authLinks}>
                <p>
                    Remember your password?{' '}
                    <a href="/login" onClick={(e) => { e.preventDefault(); onBackToLogin(); }} className={styles.link}>
                        Sign in here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
