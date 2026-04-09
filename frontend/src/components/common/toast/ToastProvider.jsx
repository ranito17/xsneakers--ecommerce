import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';
import ConfirmationToast from './ConfirmationToast';
import styles from './toast.module.css';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, duration };
        
        setToasts(prev => [...prev, newToast]);
        
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showConfirmation = useCallback((message) => {
        return new Promise((resolve) => {
            const id = Date.now() + Math.random();
            const newToast = { 
                id, 
                message, 
                type: 'confirmation',
                onConfirm: () => {
                    removeToast(id);
                    resolve(true);
                },
                onCancel: () => {
                    removeToast(id);
                    resolve(false);
                }
            };
            
            setToasts(prev => [...prev, newToast]);
        });
    }, [removeToast]);

    const showSuccess = useCallback((message, duration) => {
        return showToast(message, 'success', duration);
    }, [showToast]);

    const showError = useCallback((message, duration) => {
        return showToast(message, 'error', duration);
    }, [showToast]);

    const showWarning = useCallback((message, duration) => {
        return showToast(message, 'warning', duration);
    }, [showToast]);

    const showInfo = useCallback((message, duration) => {
        return showToast(message, 'info', duration);
    }, [showToast]);

    const value = {
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirmation,
        removeToast
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map(toast => {
                    if (toast.type === 'confirmation') {
                        return (
                            <ConfirmationToast
                                key={toast.id}
                                message={toast.message}
                                onConfirm={toast.onConfirm}
                                onCancel={toast.onCancel}
                            />
                        );
                    }
                    return (
                        <Toast
                            key={toast.id}
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={() => removeToast(toast.id)}
                        />
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;

