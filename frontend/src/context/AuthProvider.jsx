import React, { useState, useEffect, createContext, useCallback } from 'react';
import { authApi } from '../services';

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is authenticated on app load
    const checkAuth = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('🔍 Frontend: Checking authentication...');
            
            const response = await authApi.checkAuth();
            
            console.log('✅ Frontend: Auth response received');
            console.log('✅ Frontend: Response data:', response);
            
            if (response.success && response.user) {
                console.log('✅ Frontend: User authenticated:', response.user);
                setUser(response.user);
                setIsAuthenticated(true);
                console.log('✅ Frontend: State updated - user set, isAuthenticated: true');
            } else {
                console.log('❌ Frontend: No user data in response');
                console.log('❌ Frontend: response.success:', response.success);
                console.log('❌ Frontend: response.user:', response.user);
                setUser(null);
                setIsAuthenticated(false);
                console.log('❌ Frontend: State updated - user: null, isAuthenticated: false');
            }
        } catch (err) {
            console.log('❌ Frontend: Authentication request failed');
            console.log('❌ Frontend: Error status:', err.response?.status);
            console.log('❌ Frontend: Error data:', err.response?.data);
            console.log('❌ Frontend: Error message:', err.message);
            // Clear any existing user data
            setUser(null);
            setIsAuthenticated(false);
            setError(null); // Clear any previous errors
            console.log('❌ Frontend: State cleared - user: null, isAuthenticated: false');
        } finally {
            setIsLoading(false);
            console.log('🔍 Frontend: Loading state set to false');
        }
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await authApi.login(email, password);

            console.log('Login response:', response);

            if (response.success && response.user) {
                // Set user data directly from login response
                setUser(response.user);
                setIsAuthenticated(true);
                console.log('User logged in successfully:', response.user);
                return { success: true };
            } else {
                console.log('Login response missing user data');
                return { success: false, error: 'Login response missing user data' };
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed');
            return { success: false, error: err.response?.data?.message || 'Login failed' };
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Check auth on component mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const value = {
        user,
        isAuthenticated,
        login,
        logout,
        checkAuth,
        isLoading,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 