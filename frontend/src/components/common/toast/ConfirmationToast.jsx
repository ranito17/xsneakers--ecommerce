import React from 'react';
import styles from './toast.module.css';

const ConfirmationToast = ({ message, onConfirm, onCancel, duration = 0 }) => {
    return (
        <div className={`${styles.toast} ${styles.confirmation}`}>
            <div className={styles.toastContent}>
                <span className={styles.toastMessage}>{message}</span>
                <div className={styles.confirmationButtons}>
                    <button 
                        className={styles.confirmButton}
                        onClick={onConfirm}
                        aria-label="Confirm"
                    >
                        Confirm
                    </button>
                    <button 
                        className={styles.cancelButton}
                        onClick={onCancel}
                        aria-label="Cancel"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationToast;

