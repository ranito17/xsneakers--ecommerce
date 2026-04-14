// authPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthentication';
import { useToast } from '../components/common/toast';
import { authApi } from '../services/authApi';
import { validateLoginForm, validateSignupForm, validatePassword, validateConfirmPassword } from '../utils/form.validation';
import { validateEmail } from '../utils/user.utils';
import AuthContainer from '../components/auth/AuthContainer';
import { Footer } from '../components/layout';
import styles from './authPage.module.css';

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, login } = useAuth();
    const { showSuccess, showError } = useToast();
    
    // Determine current route
    const pathname = location.pathname;
    const isSignup = pathname === '/signup';
    const isForgotPassword = pathname === '/forgot-password';
    const isResetPassword = pathname === '/reset-password';
    
    // Get redirect URL from query parameters
    const searchParams = new URLSearchParams(location.search);
    const redirectTo = searchParams.get('redirect') || '/';
    
    // Login form state
    const [loginFormData, setLoginFormData] = useState({
        email: '',
        password: ''
    });
    
    // Signup form state
    const [signupFormData, setSignupFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        street: '',
        city: '',
        house_number: '',
        zipcode: '',
        phone_number: ''
    });

    // Forgot password form state
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [forgotPasswordEmailError, setForgotPasswordEmailError] = useState('');

    // Reset password form state
    const [resetPasswordEmail, setResetPasswordEmail] = useState('');
    const [resetPasswordCode, setResetPasswordCode] = useState('');
    const [resetPasswordNewPassword, setResetPasswordNewPassword] = useState('');
    const [resetPasswordConfirmPassword, setResetPasswordConfirmPassword] = useState('');
    const [resetPasswordError, setResetPasswordError] = useState('');
    const [resetPasswordPasswordError, setResetPasswordPasswordError] = useState('');
    const [resetPasswordConfirmError, setResetPasswordConfirmError] = useState('');
    const [resetPasswordTimeRemaining, setResetPasswordTimeRemaining] = useState(900);
    const [resetPasswordCountdownStarted, setResetPasswordCountdownStarted] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
    
    // Error state
    const [loginError, setLoginError] = useState({});
    const [signupError, setSignupError] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    // Password visibility states
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);


    // API Call - Login
    // שולח: email, password
    // מקבל: { success, user, token }
    const handleLogin = async (email, password) => {
        // Validate form using centralized validation
        const validation = validateLoginForm({ email, password });
        if (!validation.isValid) {
            setLoginError(validation.errors);
            return { success: false, error: validation.errors };
        }

        // Clear previous errors
        setLoginError({});
        setIsLoading(true);
        
        try {
            // Use AuthProvider's login function
            const result = await login(email, password);

            if (result.success) {
                // Redirect based on user role and redirect parameter
                if (result.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate(redirectTo);
                }
                return { success: true };
            } else {
                setLoginError({ general: result.error || 'Login failed' });
                return { success: false, error: result.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMsg = error.response?.data?.message || 'An error occurred during login';
            setLoginError({ general: errorMsg });
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };


    // API Call - Signup
    // שולח: { full_name, email, password, street?, city?, house_number?, zipcode?, phone_number? }
    // מקבל: { success, message, user? }
    const handleSignup = async (signupData) => {
        // Validate form
        const validation = validateSignupForm(signupData);
        if (!validation.isValid) {
            setSignupError(validation.errors);
            return { success: false, error: validation.errors };
        }

        // Clear previous errors
        setSignupError({});
        setIsLoading(true);
        
        try {
            // Prepare signup data - only include address/phone if provided
            const apiData = {
                full_name: signupData.full_name,
                email: signupData.email,
                password: signupData.password
            };
            
            // Only include address fields if at least one is provided
            if (signupData.street || signupData.city || signupData.house_number || signupData.zipcode) {
                apiData.street = signupData.street || '';
                apiData.city = signupData.city || '';
                apiData.house_number = signupData.house_number || '';
                apiData.zipcode = signupData.zipcode || '';
            }
            
            // Only include phone if provided
            if (signupData.phone_number && signupData.phone_number.trim()) {
                apiData.phone_number = signupData.phone_number;
            }
            
            // Attempt signup
            const response = await authApi.signup(apiData);

            if (response.success) {
                // Show success message with welcome email info
                showSuccess(`Account created successfully! Welcome to Xsneakers, ${signupData.full_name}! 🎉\n\nWe've sent a welcome email to ${signupData.email} with more information about your new account.`);
                
                navigate('/login');
                return { success: true };
            } else {
                setSignupError({ general: response.message || 'Signup failed' });
                return { success: false, error: response.message || 'Signup failed' };
            }
        } catch (error) {
            console.error('Signup error:', error);
            const errorMsg = error.response?.data?.message || 'An error occurred during signup';
            setSignupError({ general: errorMsg });
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };


    // API Call - Forgot Password
    // שולח: email
    // מקבל: { success, message }
    const handleForgotPassword = async (email) => {
        // Validate email
        if (!email) {
            showError('Please enter your email address');
            setForgotPasswordEmailError('Email is required');
            return { success: false };
        }
        
        const validation = validateEmail(email);
        if (!validation.isValid) {
            showError(validation.message);
            setForgotPasswordEmailError(validation.message);
            return { success: false };
        }

        setIsLoading(true);
        setForgotPasswordEmailError('');

        try {
            // Call the forgot password API
            const response = await authApi.forgotPassword(email);
            
            if (response.success) {
                showSuccess('Password reset code has been sent to your email address.');
                
                // Navigate to reset password page with email
                setTimeout(() => {
                    navigate('/reset-password', { state: { email } });
                }, 1500);
                return { success: true };
            } else {
                const errorMsg = response.message || 'Failed to send reset code. Please try again.';
                showError(errorMsg);
                return { success: false };
            }
            
        } catch (error) {
            console.error('Forgot password error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to send reset code. Please try again.';
            showError(errorMsg);
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };


    // API Call - Reset Password
    // שולח: email, code, newPassword, confirmPassword
    // מקבל: { success, message }
    const handleResetPassword = async (email, code, newPassword, confirmPassword) => {
        if (!email) {
            setResetPasswordError('Email is required');
            return { success: false };
        }

        if (!code || code.length !== 6) {
            setResetPasswordError('Please enter a valid 6-digit code');
            return { success: false };
        }

        // Validate password using centralized validation
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            setResetPasswordError(passwordValidation.message);
            setResetPasswordPasswordError(passwordValidation.message);
            return { success: false };
        }

        // Validate confirm password
        const confirmValidation = validateConfirmPassword(newPassword, confirmPassword);
        if (!confirmValidation.isValid) {
            setResetPasswordError(confirmValidation.message);
            setResetPasswordConfirmError(confirmValidation.message);
            return { success: false };
        }

        setIsLoading(true);
        setResetPasswordError('');

        try {
            const response = await authApi.resetPassword(email, code, newPassword, confirmPassword);
            
            if (response.success) {
                showSuccess('Password has been reset successfully!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                return { success: true };
            } else {
                const errorMsg = response.message || 'Failed to reset password. Please try again.';
                setResetPasswordError(errorMsg);
                showError(errorMsg);
                return { success: false };
            }
        } catch (error) {
            console.error('Reset password error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to reset password. Please try again.';
            setResetPasswordError(errorMsg);
            showError(errorMsg);
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };


    // Handle login form field changes
    const handleLoginChange = (e) => {
        setLoginFormData({
            ...loginFormData,
            [e.target.name]: e.target.value
        });
        
        // Clear field-specific error when user starts typing
        if (loginError[e.target.name]) {
            setLoginError(prev => ({
                ...prev,
                [e.target.name]: ''
            }));
        }
    };


    // Handle signup form field changes
    const handleSignupChange = (e) => {
        setSignupFormData({
            ...signupFormData,
            [e.target.name]: e.target.value
        });
        
        // Clear field-specific error when user starts typing
        if (signupError[e.target.name]) {
            setSignupError(prev => ({
                ...prev,
                [e.target.name]: ''
            }));
        }
    };


    // Handle forgot password email change
    const handleForgotPasswordEmailChange = (e) => {
        const value = e.target.value;
        setForgotPasswordEmail(value);
        
        // Clear previous errors
        setForgotPasswordEmailError('');
        
        // Validate email format using centralized validation
        if (value) {
            const validation = validateEmail(value);
            if (!validation.isValid) {
                setForgotPasswordEmailError(validation.message);
            }
        }
    };


    // Handle reset password field changes
    const handleResetPasswordEmailChange = (e) => {
        setResetPasswordEmail(e.target.value);
        setResetPasswordError('');
    };

    const handleResetPasswordCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setResetPasswordCode(value);
        setResetPasswordError('');
    };

    const handleResetPasswordPasswordChange = (e) => {
        const value = e.target.value;
        setResetPasswordNewPassword(value);
        setResetPasswordError('');
        setResetPasswordPasswordError('');
        
        // Real-time validation
        if (value) {
            const validation = validatePassword(value);
            if (!validation.isValid) {
                setResetPasswordPasswordError(validation.message);
            }
        }
    };

    const handleResetPasswordConfirmChange = (e) => {
        const value = e.target.value;
        setResetPasswordConfirmPassword(value);
        setResetPasswordError('');
        setResetPasswordConfirmError('');
        
        // Real-time validation
        if (value && resetPasswordNewPassword) {
            const validation = validateConfirmPassword(resetPasswordNewPassword, value);
            if (!validation.isValid) {
                setResetPasswordConfirmError(validation.message);
            }
        }
    };


    // Handle form submissions
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        await handleLogin(loginFormData.email, loginFormData.password);
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        await handleSignup(signupFormData);
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        await handleForgotPassword(forgotPasswordEmail);
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        await handleResetPassword(resetPasswordEmail, resetPasswordCode, resetPasswordNewPassword, resetPasswordConfirmPassword);
    };


    // Format time for countdown
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };


    // Initialize reset password email from navigation state
    useEffect(() => {
        if (isResetPassword && location.state?.email) {
            setResetPasswordEmail(location.state.email);
            setResetPasswordCountdownStarted(true);
            setResetPasswordTimeRemaining(900);
        } else if (isResetPassword && !location.state?.email) {
            showError('Please request a reset code first.');
            setTimeout(() => navigate('/forgot-password'), 2000);
        }
    }, [isResetPassword, location.state, navigate, showError]);


    // Countdown timer effect for reset password
    useEffect(() => {
        if (!resetPasswordCountdownStarted || resetPasswordTimeRemaining <= 0) return;

        const timer = setInterval(() => {
            setResetPasswordTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [resetPasswordCountdownStarted, resetPasswordTimeRemaining]);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageContent}>
                <AuthContainer
                    isSignup={isSignup}
                    isForgotPassword={isForgotPassword}
                    isResetPassword={isResetPassword}
                    // Login props
                    loginFormData={loginFormData}
                    loginError={loginError}
                    showLoginPassword={showLoginPassword}
                    onLoginChange={handleLoginChange}
                    onLoginSubmit={handleLoginSubmit}
                    onToggleLoginPassword={() => setShowLoginPassword(!showLoginPassword)}
                    // Signup props
                    signupFormData={signupFormData}
                    signupError={signupError}
                    showSignupPassword={showSignupPassword}
                    showSignupConfirmPassword={showSignupConfirmPassword}
                    onSignupChange={handleSignupChange}
                    onSignupSubmit={handleSignupSubmit}
                    onToggleSignupPassword={() => setShowSignupPassword(!showSignupPassword)}
                    onToggleSignupConfirmPassword={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                    // Forgot password props
                    forgotPasswordEmail={forgotPasswordEmail}
                    forgotPasswordEmailError={forgotPasswordEmailError}
                    onForgotPasswordEmailChange={handleForgotPasswordEmailChange}
                    onForgotPasswordSubmit={handleForgotPasswordSubmit}
                    // Reset password props
                    resetPasswordEmail={resetPasswordEmail}
                    resetPasswordCode={resetPasswordCode}
                    resetPasswordNewPassword={resetPasswordNewPassword}
                    resetPasswordConfirmPassword={resetPasswordConfirmPassword}
                    resetPasswordError={resetPasswordError}
                    resetPasswordPasswordError={resetPasswordPasswordError}
                    resetPasswordConfirmError={resetPasswordConfirmError}
                    showResetPassword={showResetPassword}
                    showResetConfirmPassword={showResetConfirmPassword}
                    resetPasswordTimeRemaining={resetPasswordTimeRemaining}
                    resetPasswordCountdownStarted={resetPasswordCountdownStarted}
                    onResetPasswordEmailChange={handleResetPasswordEmailChange}
                    onResetPasswordCodeChange={handleResetPasswordCodeChange}
                    onResetPasswordPasswordChange={handleResetPasswordPasswordChange}
                    onResetPasswordConfirmChange={handleResetPasswordConfirmChange}
                    onResetPasswordSubmit={handleResetPasswordSubmit}
                    onToggleResetPassword={() => setShowResetPassword(!showResetPassword)}
                    onToggleResetConfirmPassword={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                    formatTime={formatTime}
                    // Navigation
                    onNavigateToSignup={() => navigate('/signup')}
                    onNavigateToLogin={() => navigate('/login')}
                    onNavigateToForgotPassword={() => navigate('/forgot-password')}
                    onRequestNewCode={() => navigate('/forgot-password', { state: { email: resetPasswordEmail } })}
                    // Loading state
                    isLoading={isLoading}
                />
            </div>
            <Footer />
        </div>
    );
};

export default AuthPage;
