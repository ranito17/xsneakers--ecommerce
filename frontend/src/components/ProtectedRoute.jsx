import React from 'react';
import useAuthorization from '../hooks/useAuthorization';
import UnauthorizedPage from '../pages/UnauthorizedPage';

const ProtectedRoute = ({ 
    children, 
    requiredRole = null, 
    fallback = null,
    redirectToLogin = false 
}) => {
    const { isAuthorized, isLoading, redirectToUnauthorized, redirectToLogin: goToLogin } = useAuthorization(requiredRole);
    // Show loading state
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)'
            }}>
                <div style={{
                    color: '#cbd5e1',
                    fontSize: '1.2rem',
                    fontWeight: '600'
                }}>
                    Loading...
                </div>
            </div>
        );
    }

    // User is authorized, render children
    if (isAuthorized) {
        return children;
    }

    // User is not authorized
    if (redirectToLogin) {
        // Redirect to login after a short delay
        setTimeout(() => {
            goToLogin();
        }, 100);
        return null;
    }

    // Show unauthorized page or custom fallback
    if (fallback) {
        return fallback;
    }

    return <UnauthorizedPage />;
};

export default ProtectedRoute; 