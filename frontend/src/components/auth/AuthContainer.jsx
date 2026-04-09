import React from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import styles from './auth.module.css';

const AuthContainer = ({
    isSignup,
    isForgotPassword,
    isResetPassword,
    // Login props
    loginFormData,
    loginError,
    showLoginPassword,
    onLoginChange,
    onLoginSubmit,
    onToggleLoginPassword,
    // Signup props
    signupFormData,
    signupError,
    showSignupPassword,
    showSignupConfirmPassword,
    onSignupChange,
    onSignupSubmit,
    onToggleSignupPassword,
    onToggleSignupConfirmPassword,
    // Forgot password props
    forgotPasswordEmail,
    forgotPasswordEmailError,
    onForgotPasswordEmailChange,
    onForgotPasswordSubmit,
    // Reset password props
    resetPasswordEmail,
    resetPasswordCode,
    resetPasswordNewPassword,
    resetPasswordConfirmPassword,
    resetPasswordError,
    resetPasswordPasswordError,
    resetPasswordConfirmError,
    showResetPassword,
    showResetConfirmPassword,
    resetPasswordTimeRemaining,
    resetPasswordCountdownStarted,
    onResetPasswordEmailChange,
    onResetPasswordCodeChange,
    onResetPasswordPasswordChange,
    onResetPasswordConfirmChange,
    onResetPasswordSubmit,
    onToggleResetPassword,
    onToggleResetConfirmPassword,
    formatTime,
    // Navigation
    onNavigateToSignup,
    onNavigateToLogin,
    onNavigateToForgotPassword,
    onRequestNewCode,
    onBackToLogin,
    // Loading state
    isLoading
}) => {
    // Determine which form to show based on route
    if (isResetPassword) {
        return (
            <ResetPasswordForm
                email={resetPasswordEmail}
                code={resetPasswordCode}
                newPassword={resetPasswordNewPassword}
                confirmPassword={resetPasswordConfirmPassword}
                error={resetPasswordError}
                passwordError={resetPasswordPasswordError}
                confirmError={resetPasswordConfirmError}
                isLoading={isLoading}
                showPassword={showResetPassword}
                showConfirmPassword={showResetConfirmPassword}
                timeRemaining={resetPasswordTimeRemaining}
                countdownStarted={resetPasswordCountdownStarted}
                onChange={onResetPasswordEmailChange}
                onCodeChange={onResetPasswordCodeChange}
                onPasswordChange={onResetPasswordPasswordChange}
                onConfirmPasswordChange={onResetPasswordConfirmChange}
                onSubmit={onResetPasswordSubmit}
                onTogglePassword={onToggleResetPassword}
                onToggleConfirmPassword={onToggleResetConfirmPassword}
                onRequestNewCode={onRequestNewCode}
                onBackToLogin={onNavigateToLogin}
                formatTime={formatTime}
            />
        );
    }

    if (isForgotPassword) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authWrapper}>
                    <div className={styles.formSection}>
                        <ForgotPasswordForm
                            email={forgotPasswordEmail}
                            emailError={forgotPasswordEmailError}
                            isLoading={isLoading}
                            onChange={onForgotPasswordEmailChange}
                            onSubmit={onForgotPasswordSubmit}
                            onBackToLogin={onNavigateToLogin}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.authWrapper}>
                {/* Form Section */}
                <div className={styles.formSection}>
                    {isSignup ? (
                        <SignupForm
                            formData={signupFormData}
                            error={signupError}
                            isLoading={isLoading}
                            showPassword={showSignupPassword}
                            showConfirmPassword={showSignupConfirmPassword}
                            onChange={onSignupChange}
                            onSubmit={onSignupSubmit}
                            onTogglePassword={onToggleSignupPassword}
                            onToggleConfirmPassword={onToggleSignupConfirmPassword}
                            onNavigateToLogin={onNavigateToLogin}
                        />
                    ) : (
                        <LoginForm
                            formData={loginFormData}
                            error={loginError}
                            isLoading={isLoading}
                            showPassword={showLoginPassword}
                            onChange={onLoginChange}
                            onSubmit={onLoginSubmit}
                            onTogglePassword={onToggleLoginPassword}
                            onNavigateToSignup={onNavigateToSignup}
                            onNavigateToForgotPassword={onNavigateToForgotPassword}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthContainer;
