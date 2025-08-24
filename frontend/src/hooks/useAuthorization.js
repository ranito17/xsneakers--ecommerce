import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuthentication';

const useAuthorization = (requiredRole = null) => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    // Use useMemo to compute authorization status
    const authorizationStatus = useMemo(() => {
        // If auth is still loading, return loading state
        if (authLoading) {
            return { isAuthorized: false, isLoading: true };
        }
        
        // If no authentication required, allow access
        if (!requiredRole) {
            return { isAuthorized: true, isLoading: false };
        }
        
        // Check if user is authenticated
        if (!isAuthenticated || !user) {
            return { isAuthorized: false, isLoading: false };
        }
        
        // Check if user has required role
        if (requiredRole === 'admin' && user.role !== 'admin') {
            return { isAuthorized: false, isLoading: false };
        }
        
        // User is authorized
        return { isAuthorized: true, isLoading: false };
    }, [user, isAuthenticated, requiredRole, authLoading]);

    const redirectToUnauthorized = () => {
        navigate('/unauthorized');
    };

    const redirectToLogin = () => {
        navigate('/login');
    };

    return {
        isAuthorized: authorizationStatus.isAuthorized,
        isLoading: authorizationStatus.isLoading,
        user,           
        redirectToUnauthorized,
        redirectToLogin
    };
};

export default useAuthorization; 