import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import styles from './auth.module.css';

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [emailError, setEmailError] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        
        // Clear previous errors
        setError('');
        setEmailError('');
        
        // Validate email format
        if (value && !validateEmail(value)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate email
        if (!email) {
            setError('Please enter your email address');
            return;
        }
        
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // Call the forgot password API
            const response = await authApi.forgotPassword(email);
            
            if (response.success) {
                setSuccess('Password reset instructions have been sent to your email address.');
                
                // Clear form
                setEmail('');
            } else {
                setError(response.message || 'Failed to send reset email. Please try again.');
            }
            
        } catch (error) {
            console.error('Forgot password error:', error);
            setError('Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h1 className={styles.authTitle}>Forgot Password</h1>
                    <p className={styles.authSubtitle}>
                        Enter your email address and we'll send you instructions to reset your password.
                    </p>
                </div>

                {error && (
                    <div className={styles.authError}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 002.18 2.18L20.14 9.71a2 2 0 00-2.18-2.18z"/>
                            <path d="M12 9v4M12 17h.01"/>
                        </svg>
                        {error}
                    </div>
                )}

                {success && (
                    <div className={styles.authSuccess}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22,4 12,14.01 9,11.01"/>
                        </svg>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.formLabel}>
                            Email Address
                        </label>
                        <div className={styles.inputContainer}>
                            <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="Enter your email address"
                                className={`${styles.formInput} ${emailError ? styles.inputError : ''}`}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        {emailError && (
                            <span className={styles.fieldError}>{emailError}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`${styles.authButton} ${isLoading ? styles.loading : ''}`}
                        disabled={isLoading || !email || emailError}
                    >
                        {isLoading ? (
                            <>
                                <div className={styles.spinner}></div>
                                Sending...
                            </>
                        ) : (
                            'Send Reset Instructions'
                        )}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    <button
                        type="button"
                        onClick={handleBackToLogin}
                        className={styles.backButton}
                        disabled={isLoading}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
