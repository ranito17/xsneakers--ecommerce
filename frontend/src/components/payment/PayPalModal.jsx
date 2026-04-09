import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useToast } from '../common/toast';
import { paymentApi } from '../../services/paymentApi';
import styles from './paypalModal.module.css';

const PayPalModal = ({ isOpen, onClose, onSuccess, amount, currency, description, storeOrderPayload }) => {
    const { showError } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'ASYNBP7KWMlcqf4zWjXHlyEYjm30NTu93Z1kP8BfOK9qYb8oDSAqu7WzCo1346BImxZMsui1KSSsse3V';

    const createOrder = async (data, actions) => {
        try {
            setIsProcessing(true);
            const orderData = {
                amount: amount,
                currency: currency || 'ILS',
                description: description || 'Order payment'
            };
            
            const result = await paymentApi.createPayPalOrder(orderData);
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to create PayPal order');
            }

            setIsProcessing(false);
            return result.orderId;
        } catch (error) {
            console.error('PayPal create order error:', error);
            showError(error.message || 'Failed to initialize PayPal payment');
            setIsProcessing(false);
            throw error;
        }
    };

    const onApprove = async (data, actions) => {
        try {
            setIsProcessing(true);
            
            if (!storeOrderPayload?.address || !Array.isArray(storeOrderPayload?.items)) {
                throw new Error('Missing order payload for checkout');
            }

            // Capture the payment on backend and create the store order only after capture
            const result = await paymentApi.capturePayPalOrder({
                orderId: data.orderID,
                address: storeOrderPayload.address,
                items: storeOrderPayload.items,
                delivery_cost: storeOrderPayload.delivery_cost
            });
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to capture payment');
            }

            setIsProcessing(false);
            onSuccess({
                transactionId: result.transactionId,
                orderId: result.orderId,
                orderNumber: result.orderNumber,
                demo: result.demo
            });
        } catch (error) {
            console.error('PayPal capture error:', error);
            showError(error.message || 'Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    const onError = (err) => {
        console.error('PayPal error:', err);
        showError('An error occurred with PayPal. Please try again.');
        setIsProcessing(false);
    };

    const onCancel = () => {
        setIsProcessing(false);
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>PayPal Payment</h2>
                    <button className={styles.closeButton} onClick={onClose} disabled={isProcessing}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.paymentInfo}>
                        <p className={styles.amountLabel}>Amount to pay:</p>
                        <p className={styles.amount}>{currency || 'ILS'} {amount}</p>
                        {description && (
                            <p className={styles.description}>{description}</p>
                        )}
                    </div>

                    {isProcessing && (
                        <div className={styles.processing}>
                            <div className={styles.spinner}></div>
                            <p>Processing payment...</p>
                        </div>
                    )}

                    <div className={styles.paypalContainer}>
                        <PayPalScriptProvider
                            options={{
                                clientId: paypalClientId,
                                currency: currency || 'ILS',
                                intent: 'capture',
                                'enable-funding': 'paypal',
                                'disable-funding': 'card,credit'
                            }}
                        >
                            <PayPalButtons
                                createOrder={createOrder}
                                onApprove={onApprove}
                                onError={onError}
                                onCancel={onCancel}
                                disabled={isProcessing}
                                fundingSource={window.paypal?.FUNDING?.PAYPAL}
                                style={{
                                    layout: 'vertical',
                                    color: 'blue',
                                    shape: 'rect',
                                    label: 'paypal'
                                }}
                            />
                        </PayPalScriptProvider>
                    </div>

                    <div className={styles.testModeNotice}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        <span>Test Mode: This is a sandbox transaction. No real money will be charged.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayPalModal;

