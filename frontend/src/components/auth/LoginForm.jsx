import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services';
import styles from './auth.module.css';

const LoginForm = () => {
    const navigate = useNavigate();
    
    // Form state - only login fields
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
        
        // No validation for login - only check if fields are not empty
        if (!formData.email.trim() || !formData.password.trim()) {
            setError({ general: 'Please fill in all fields' });
            return;
        }

        // Clear previous errors
        setError({});
        setIsLoading(true);
        
        try {
            // Attempt login
            const response = await authApi.login(formData.email, formData.password);

            if (response.success) {
                console.log('Login successful:', response);
                navigate('/');
            } else {
                setError({ general: response.message || 'Login failed' });
            }
        } catch (error) {
            console.error('Login error:', error);
            setError({ 
                general: error.response?.data?.message || 'An error occurred during login' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authForm}>
            <h2>Welcome Back</h2>
            <p className={styles.subtitle}>Sign in to your account</p>
            
            <form onSubmit={handleSubmit}>
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
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                        className={error.password ? styles.errorInput : ''}
                    />
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
                    <a href="/signup" className={styles.link}>
                        Sign up here
                    </a>
                </p>
                <p>
                    <button 
                        type="button" 
                        onClick={() => navigate('/forgot-password')} 
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
