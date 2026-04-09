import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../hooks/useAuthentication';
import { useLocation } from 'react-router-dom';

// Create context for admin store view state
const AdminStoreViewContext = createContext();

// Hook to check if admin is viewing store (export this directly)
export const useStoreView = () => {
    const context = useContext(AdminStoreViewContext);
    if (!context) {
        // Return default if not within provider
        return { isAdminViewingStore: false };
    }
    return context;
};

// Provider component - now checks location to determine if on customer pages
export const AdminStoreViewProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    // Determine if current user is admin viewing customer-facing pages
    const isAdminViewingStore = useMemo(() => {
        // Must be authenticated as admin
        if (!isAuthenticated || user?.role !== 'admin') {
            return false;
        }

        // Check if on customer pages (not admin or auth routes)
        const path = location.pathname;
        const isAdminRoute = path.startsWith('/admin');
        const isAuthRoute = path.startsWith('/login') || 
                           path.startsWith('/signup') ||
                           path.startsWith('/reset-password') ||
                           path.startsWith('/forgot-password');

        // Admin is viewing store if NOT on admin or auth routes
        return !isAdminRoute && !isAuthRoute;
    }, [isAuthenticated, user?.role, location.pathname]);

    const value = {
        isAdminViewingStore
    };

    return (
        <AdminStoreViewContext.Provider value={value}>
            {children}
        </AdminStoreViewContext.Provider>
    );
};

