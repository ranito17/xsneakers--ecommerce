import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services';
import { validateSignupForm } from '../../utils/validators';
import styles from './auth.module.css';

const SignupForm = () => {
    const navigate = useNavigate();
    
    // Form state - all signup fields
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
        phone_number: ''
    });
    
    // Error state
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Handle form field changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        
        // Clear field-specific error when user starts typing
        if (error[e.target.name]) {
            setError(prev => ({
                ...prev,
                [e.target.name]: ''
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const validation = validateSignupForm(formData);
        if (!validation.isValid) {
            setError(validation.errors);
            return;
        }

        // Clear previous errors
        setError({});
        setIsLoading(true);
        
        try {
            // Attempt signup
            const response = await authApi.signup({
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password,
                address: formData.address,
                phone_number: formData.phone_number
            });

            if (response.success) {
                console.log('Signup successful:', response);
                
                // Show success message with welcome email info
                alert(`Account created successfully! Welcome to Xsneakers, ${formData.full_name}! 🎉\n\nWe've sent a welcome email to ${formData.email} with more information about your new account.`);
                
                navigate('/login');
            } else {
                setError({ general: response.message || 'Signup failed' });
            }
        } catch (error) {
            console.error('Signup error:', error);
            setError({ 
                general: error.response?.data?.message || 'An error occurred during signup' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authForm}>
            <h2>Create Account</h2>
            <p className={styles.subtitle}>Join us and start shopping</p>
            
            <form onSubmit={handleSubmit}>
                {/* Full Name Field */}
                <div className={styles.formGroup}>
                    <label htmlFor="full_name">Full Name</label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        required
                        disabled={isLoading}
                        className={error.password ? styles.errorInput : ''}
                    />
                    {error.password && <span className={styles.error}>{error.password}</span>}
                </div>

                {/* Confirm Password Field */}
                <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                        className={error.confirmPassword ? styles.errorInput : ''}
                    />
                    {error.confirmPassword && <span className={styles.error}>{error.confirmPassword}</span>}
                </div>

                {/* Address Field */}
                <div className={styles.formGroup}>
                    <label htmlFor="address">Address</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your address"
                        required
                        disabled={isLoading}
                        className={error.address ? styles.errorInput : ''}
                    />
                    {error.address && <span className={styles.error}>{error.address}</span>}
                </div>

                {/* Phone Number Field */}
                <div className={styles.formGroup}>
                    <label htmlFor="phone_number">Phone Number</label>
                    <input
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="Enter 10 digits (e.g., 1234567890)"
                        required
                        disabled={isLoading}
                        className={error.phone_number ? styles.errorInput : ''}
                    />
                    {error.phone_number && <span className={styles.error}>{error.phone_number}</span>}
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
                    <a href="/login" className={styles.link}>
                        Sign in here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SignupForm;
