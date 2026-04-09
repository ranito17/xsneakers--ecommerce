import React from 'react';
import styles from './toast.module.css';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div className={`${styles.toast} ${styles[type]}`}>
            <div className={styles.toastContent}>
                <span className={styles.toastMessage}>{message}</span>
                <button 
                    className={styles.toastClose}
                    onClick={onClose}
                    aria-label="Close toast"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Toast;

