import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './auth.module.css';

const LoginForm = ({ 
    formData, 
    error, 
    isLoading, 
    showPassword, 
    onChange, 
    onSubmit, 
    onTogglePassword,
    onNavigateToSignup,
    onNavigateToForgotPassword
}) => {
    const navigate = useNavigate();

    return (
        <div className={styles.authForm}>
            <div className={styles.authFormHeader}>
                <h2>Welcome Back to Xsneakers</h2>
                <p className={styles.subtitle}>Sign in to continue your sneaker journey</p>
            </div>
            
            <form onSubmit={onSubmit} className={styles.loginFormContent}>
                {/* Email Field */}
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                        className={error.email ? styles.errorInput : ''}
                    />
                    {error.email && <span className={styles.error}>{error.email}</span>}
                </div>

                {/* Password Field */}
                <div className={styles.formGroup}>
                    <label htmlFor="password">Password</label>
                    <div className={styles.passwordInputContainer}>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={onChange}
                            placeholder="Enter your password"
                            required
                            disabled={isLoading}
                            className={error.password ? styles.errorInput : ''}
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
                    {error.password && <span className={styles.error}>{error.password}</span>}
                </div>

                {/* General Error */}
                {error.general && (
                    <div className={`${styles.error} ${styles.generalError}`}>
                        {error.general}
                    </div>
                )}

                {/* Submit Button */}
                <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
            
            {/* Navigation Links */}
            <div className={styles.authLinks}>
                <p>
                    Don't have an account?{' '}
                    <a href="/signup" onClick={(e) => { e.preventDefault(); onNavigateToSignup(); }} className={styles.link}>
                        Sign up here
                    </a>
                </p>
                <p>
                    <button 
                        type="button" 
                        onClick={onNavigateToForgotPassword} 
                        className={styles.link}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        Forgot your password?
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
