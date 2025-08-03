import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/authApi';
import styles from './authPage.module.css';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isValidToken, setIsValidToken] = useState(false);
    const [isCheckingToken, setIsCheckingToken] = useState(true);

    const token = searchParams.get('token');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError('Invalid reset link. Please request a new password reset.');
                setIsCheckingToken(false);
                return;
            }

            try {
                const response = await authApi.verifyResetToken(token);
                if (response.success) {
                    setIsValidToken(true);
                } else {
                    setError('Invalid or expired reset link. Please request a new password reset.');
                }
            } catch (error) {
                console.error('Token verification error:', error);
                setError('Invalid or expired reset link. Please request a new password reset.');
            } finally {
                setIsCheckingToken(false);
            }
        };

        verifyToken();
    }, [token]);

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        setError('');
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords
        if (!validatePassword(newPassword)) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await authApi.resetPassword(token, newPassword);
            
            if (response.success) {
                setSuccess('Password has been reset successfully!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(response.message || 'Failed to reset password. Please try again.');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            setError('Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    if (isCheckingToken) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <div className={styles.authHeader}>
                        <h1 className={styles.authTitle}>Verifying Reset Link</h1>
                        <p className={styles.authSubtitle}>
                            Please wait while we verify your reset link...
                        </p>
                    </div>
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Verifying...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <div className={styles.authHeader}>
                        <h1 className={styles.authTitle}>Invalid Reset Link</h1>
                        <p className={styles.authSubtitle}>
                            The password reset link is invalid or has expired.
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

                    <div className={styles.authFooter}>
                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            className={styles.backButton}
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
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h1 className={styles.authTitle}>Reset Password</h1>
                    <p className={styles.authSubtitle}>
                        Enter your new password below.
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
                        <label htmlFor="newPassword" className={styles.formLabel}>
                            New Password
                        </label>
                        <div className={styles.inputContainer}>
                            <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 15v2M6 12a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2z"/>
                                <path d="M12 2a3 3 0 0 0-3 3v3a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                            </svg>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter your new password"
                                className={styles.formInput}
                                disabled={isLoading}
                                required
                                minLength="6"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword" className={styles.formLabel}>
                            Confirm New Password
                        </label>
                        <div className={styles.inputContainer}>
                            <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 15v2M6 12a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2z"/>
                                <path d="M12 2a3 3 0 0 0-3 3v3a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                            </svg>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                placeholder="Confirm your new password"
                                className={styles.formInput}
                                disabled={isLoading}
                                required
                                minLength="6"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`${styles.authButton} ${isLoading ? styles.loading : ''}`}
                        disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    >
                        {isLoading ? (
                            <>
                                <div className={styles.spinner}></div>
                                Resetting Password...
                            </>
                        ) : (
                            'Reset Password'
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

export default ResetPasswordPage; 