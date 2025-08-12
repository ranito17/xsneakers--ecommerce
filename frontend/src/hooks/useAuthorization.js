import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuthentication';

const useAuthorization = (requiredRole = null) => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuthorization = () => {
            setIsLoading(true);

            // If no authentication required, allow access
            if (!requiredRole) {
                setIsAuthorized(true);
                setIsLoading(false);
                return;
            }

            // Check if user is authenticated
            if (!isAuthenticated || !user) {
                setIsAuthorized(false);
                setIsLoading(false);
                return;
            }

            // Check if user has required role
            if (requiredRole === 'admin' && user.role !== 'admin') {
                setIsAuthorized(false);
                setIsLoading(false);
                return;
            }

            // User is authorized
            setIsAuthorized(true);
            setIsLoading(false);
        };

        checkAuthorization();
    }, [user, isAuthenticated, requiredRole]);

    const redirectToUnauthorized = () => {
        navigate('/unauthorized');
    };

    const redirectToLogin = () => {
        navigate('/login');
    };

    return {
        isAuthorized,
        isLoading,
        user,           
        redirectToUnauthorized,
        redirectToLogin
    };
};

export default useAuthorization; 