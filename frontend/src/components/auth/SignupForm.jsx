import React from 'react';
import styles from './auth.module.css';

const SignupForm = ({ 
    formData, 
    error, 
    isLoading, 
    showPassword, 
    showConfirmPassword,
    onChange, 
    onSubmit, 
    onTogglePassword,
    onToggleConfirmPassword,
    onNavigateToLogin
}) => {

    return (
        <div className={styles.authForm}>
            <div className={styles.authFormHeader}>
                <h2>Join Xsneakers</h2>
                <p className={styles.subtitle}>Create your account and discover exclusive sneakers</p>
            </div>
            
            <form onSubmit={onSubmit} className={styles.signupFormContent}>
                {/* Full Name Field */}
                <div className={styles.formGroup}>
                    <label htmlFor="full_name">Full Name</label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={onChange}
                        placeholder="Enter your full name"
                        required
                        disabled={isLoading}
                        className={error.full_name ? styles.errorInput : ''}
                    />
                    {error.full_name && <span className={styles.error}>{error.full_name}</span>}
                </div>

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
                            placeholder="Create a password"
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

                {/* Confirm Password Field */}
                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className={styles.passwordInputContainer}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={onChange}
                            placeholder="Confirm your password"
                            required
                            disabled={isLoading}
                            className={error.confirmPassword ? styles.errorInput : ''}
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
                    {error.confirmPassword && <span className={styles.error}>{error.confirmPassword}</span>}
                </div>

                {/* Optional Address Section */}
                <div className={styles.optionalSection}>
                    <h3 className={styles.optionalSectionTitle}>Optional Information</h3>
                    <p className={styles.optionalSectionSubtitle}>
                        You can add your address and phone number later. These are required when placing an order.
                    </p>
                </div>

                {/* Street Field */}
                <div className={styles.formGroup}>
                    <label htmlFor="street">Street <span className={styles.optionalLabel}>(Optional)</span></label>
                    <input
                        type="text"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={onChange}
                        placeholder="Enter your street name"
                        disabled={isLoading}
                        className={error.street ? styles.errorInput : ''}
                    />
                    {error.street && <span className={styles.error}>{error.street}</span>}
                </div>

                {/* City and House Number Row */}
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="city">City <span className={styles.optionalLabel}>(Optional)</span></label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={onChange}
                            placeholder="New York"
                            disabled={isLoading}
                            className={error.city ? styles.errorInput : ''}
                        />
                        {error.city && <span className={styles.error}>{error.city}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="house_number">House Number <span className={styles.optionalLabel}>(Optional)</span></label>
                        <input
                            type="text"
                            id="house_number"
                            name="house_number"
                            value={formData.house_number}
                            onChange={onChange}
                            placeholder="123"
                            disabled={isLoading}
                            className={error.house_number ? styles.errorInput : ''}
                        />
                        {error.house_number && <span className={styles.error}>{error.house_number}</span>}
                    </div>
                </div>

                {/* Zipcode and Phone Row */}
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="zipcode">Zip Code <span className={styles.optionalLabel}>(Optional)</span></label>
                        <input
                            type="text"
                            id="zipcode"
                            name="zipcode"
                            value={formData.zipcode}
                            onChange={onChange}
                            placeholder="12345"
                            disabled={isLoading}
                            className={error.zipcode ? styles.errorInput : ''}
                        />
                        {error.zipcode && <span className={styles.error}>{error.zipcode}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="phone_number">Phone Number <span className={styles.optionalLabel}>(Optional)</span></label>
                        <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={onChange}
                            placeholder="1234567890"
                            disabled={isLoading}
                            className={error.phone_number ? styles.errorInput : ''}
                        />
                        {error.phone_number && <span className={styles.error}>{error.phone_number}</span>}
                    </div>
                </div>


                {/* Role Display */}
                <div className={styles.formGroup}>
                    <label>Account Type</label>
                    <div className={styles.roleDisplay}>
                        <span className={styles.customerRole}>Customer Account</span>
                        <small>All new users are registered as customers</small>
                    </div>
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
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>
            
            {/* Navigation Links */}
            <div className={styles.authLinks}>
                <p>
                    Already have an account?{' '}
                    <a href="/login" onClick={(e) => { e.preventDefault(); onNavigateToLogin(); }} className={styles.link}>
                        Sign in here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SignupForm;
