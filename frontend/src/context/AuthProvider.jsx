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
    const checkAuth = async () => {
        try {
            setIsLoading(true);
            
            const response = await authApi.checkAuth();
            
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
    };

    // Login function - immediately set user state
    const login = async (email, password) => {
        try {
            console.log('🔐 AuthProvider: Starting login process...');
            setIsLoading(true);
            setError(null);
            
            const response = await authApi.login(email, password);

            console.log('🔐 AuthProvider: Login API response:', response);

            if (response.success && response.user) {
                // Immediately set user data and authentication state
                console.log('🔐 AuthProvider: Setting user state to:', response.user);
                setUser(response.user);
                setIsAuthenticated(true);
                console.log('✅ AuthProvider: User logged in successfully:', response.user);
                console.log('✅ AuthProvider: State updated - isAuthenticated: true, user.id:', response.user.id);
                return { success: true,user:response.user };
            } else {
                console.log('❌ AuthProvider: Login response missing user data');
                console.log('❌ AuthProvider: response.success:', response.success);
                console.log('❌ AuthProvider: response.user:', response.user);
                return { success: false, error: 'Login response missing user data' };
            }
        } catch (err) {
            console.error('❌ AuthProvider: Login error:', err);
            setError(err.response?.data?.message || 'Login failed');
            return { success: false, error: err.response?.data?.message || 'Login failed' };
        } finally {
            setIsLoading(false);
            console.log('🔐 AuthProvider: Login process completed');
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Immediately clear user state
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

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