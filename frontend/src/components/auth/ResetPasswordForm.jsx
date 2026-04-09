import React from 'react';
import styles from '../../pages/authPage.module.css';

const ResetPasswordForm = ({
    email,
    code,
    newPassword,
    confirmPassword,
    error,
    passwordError,
    confirmError,
    isLoading,
    showPassword,
    showConfirmPassword,
    timeRemaining,
    countdownStarted,
    onChange,
    onCodeChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onSubmit,
    onTogglePassword,
    onToggleConfirmPassword,
    onRequestNewCode,
    onBackToLogin,
    formatTime
}) => {
    if (!email) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <div className={styles.authHeader}>
                        <h1 className={styles.authTitle}>Redirecting...</h1>
                        <p className={styles.authSubtitle}>
                            Please request a reset code first.
                        </p>
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
                        Enter the code sent to your email and your new password.
                    </p>
                </div>

                {/* Code Expiry Note */}
                <div className={styles.codeExpiryNote}>
                    ⏱️ Your reset code will expire in 15 minutes
                </div>

                {/* Countdown Timer */}
                {countdownStarted && (
                    <div className={`${styles.countdownTimer} ${timeRemaining < 300 ? styles.expiring : ''} ${timeRemaining === 0 ? styles.expired : ''}`}>
                        <div className={styles.countdownText}>
                            <span>Code expires in:</span>
                            <span className={styles.countdownTime}>{formatTime(timeRemaining)}</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className={styles.authError}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 002.18 2.18L20.14 9.71a2 2 0 00-2.18-2.18z"/>
                            <path d="M12 9v4M12 17h.01"/>
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className={styles.authForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.formLabel}>
                            Email
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
                                onChange={onChange}
                                placeholder="Enter your email"
                                className={styles.formInput}
                                disabled={isLoading}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="code" className={styles.formLabel}>
                            Reset Code
                        </label>
                        <div className={styles.inputContainer}>
                            <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0110 0v4"/>
                            </svg>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                value={code}
                                onChange={onCodeChange}
                                placeholder="Enter 6-digit code"
                                className={`${styles.formInput} ${timeRemaining === 0 ? styles.inputError : ''}`}
                                disabled={isLoading || timeRemaining === 0}
                                maxLength="6"
                                required
                            />
                        </div>
                        {timeRemaining === 0 && (
                            <span className={styles.fieldError}>Code has expired. Please request a new one.</span>
                        )}
                    </div>

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
                                type={showPassword ? "text" : "password"}
                                id="newPassword"
                                name="newPassword"
                                value={newPassword}
                                onChange={onPasswordChange}
                                placeholder="Enter your new password (6+ chars, letters & numbers)"
                                className={`${styles.formInput} ${passwordError ? styles.inputError : ''}`}
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={onTogglePassword}
                                disabled={isLoading}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {passwordError && (
                            <span className={styles.fieldError}>{passwordError}</span>
                        )}
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
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={onConfirmPasswordChange}
                                placeholder="Confirm your new password"
                                className={`${styles.formInput} ${confirmError ? styles.inputError : ''}`}
                                disabled={isLoading}
                                required
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={onToggleConfirmPassword}
                                disabled={isLoading}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {confirmError && (
                            <span className={styles.fieldError}>{confirmError}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`${styles.authButton} ${isLoading ? styles.loading : ''}`}
                        disabled={isLoading || !email || !code || code.length !== 6 || !newPassword || !confirmPassword || passwordError || confirmError || timeRemaining === 0}
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
                        onClick={onRequestNewCode}
                        className={styles.backButton}
                        disabled={isLoading}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Request New Code
                    </button>
                    <button
                        type="button"
                        onClick={onBackToLogin}
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

export default ResetPasswordForm;

