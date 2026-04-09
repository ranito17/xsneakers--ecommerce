import React from 'react';
import styles from './paymentForm.module.css';

const PaymentForm = ({ 
    paymentMethod, 
    onPaymentMethodChange, 
    formData, 
    onInputChange,
    savedAddress,
    formattedSavedAddress,
    useSavedAddress,
    onUseSavedAddress,
    onChangeAddress
}) => {
    return (
        <>
            {/* Payment Method Selection */}
            <div className={styles.paymentMethods}>
                <h3>Select Payment Method</h3>
                <div className={styles.methodOptions}>
                    <label className={`${styles.methodOption} ${paymentMethod === 'credit-card' ? styles.active : ''}`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="credit-card"
                            checked={paymentMethod === 'credit-card'}
                            onChange={(e) => onPaymentMethodChange(e.target.value)}
                        />
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="5" width="20" height="14" rx="2"/>
                            <line x1="2" y1="10" x2="22" y2="10"/>
                        </svg>
                        <span>Credit/Debit Card</span>
                    </label>
                    
                    <label className={`${styles.methodOption} ${paymentMethod === 'paypal' ? styles.active : ''}`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="paypal"
                            checked={paymentMethod === 'paypal'}
                            onChange={(e) => onPaymentMethodChange(e.target.value)}
                        />
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <span>PayPal</span>
                    </label>
                </div>
            </div>

            {/* Test Mode Notice */}
            <div className={styles.testModeNotice}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span><strong>Test Mode:</strong> No payment information required. Click "Place Test Order" to continue.</span>
            </div>

            {/* Payment Form */}
            {paymentMethod === 'credit-card' ? (
                <>
                    <div className={styles.formGroup}>
                        <label>Card Number <span className={styles.optional}>(Optional - Test Mode)</span></label>
                        <input
                            type="text"
                            name="cardNumber"
                            placeholder="1234 5678 9012 3456 (Optional)"
                            value={formData.cardNumber}
                            onChange={onInputChange}
                            maxLength="19"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Cardholder Name <span className={styles.optional}>(Optional - Test Mode)</span></label>
                        <input
                            type="text"
                            name="cardName"
                            placeholder="John Doe (Optional)"
                            value={formData.cardName}
                            onChange={onInputChange}
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Expiry Date <span className={styles.optional}>(Optional)</span></label>
                            <input
                                type="text"
                                name="expiryDate"
                                placeholder="MM/YY (Optional)"
                                value={formData.expiryDate}
                                onChange={onInputChange}
                                maxLength="5"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>CVV <span className={styles.optional}>(Optional)</span></label>
                            <input
                                type="text"
                                name="cvv"
                                placeholder="123 (Optional)"
                                value={formData.cvv}
                                onChange={onInputChange}
                                maxLength="3"
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className={styles.paypalInfo}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p><strong>Test Mode:</strong> PayPal payment simulation. Click "Place Test Order" to continue.</p>
                </div>
            )}

            <div className={styles.divider}></div>

            {/* Delivery Address */}
            <div className={styles.addressFormSection}>
            <h3>Delivery Address</h3>
            
            {/* Optional "Use Saved Address" Button */}
            {savedAddress && !useSavedAddress && savedAddress.house_number && (
                <div className={styles.useSavedButtonContainer}>
                    <button
                        type="button"
                        onClick={onUseSavedAddress}
                        className={styles.useSavedButton}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        Use My Saved Address
                    </button>
                </div>
            )}

            {/* Address Display (if using saved address) */}
            {useSavedAddress && formattedSavedAddress ? (
                <div className={styles.savedAddressDisplay}>
                    <div className={styles.savedAddressBox}>
                        <p className={styles.savedAddressLabel}>Delivery Address:</p>
                        <p className={styles.savedAddressText}>{formattedSavedAddress}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onChangeAddress}
                        className={styles.changeAddressButton}
                    >
                        Change Address
                    </button>
                </div>
            ) : (
                /* Address Form (required fields) */
                <>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>House Number <span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                name="house_number"
                                placeholder="123"
                                value={formData.house_number}
                                onChange={onInputChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Street <span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                name="street"
                                placeholder="Main Street"
                                value={formData.street}
                                onChange={onInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>City <span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                name="city"
                                placeholder="New York"
                                value={formData.city}
                                onChange={onInputChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Zipcode <span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                name="zipcode"
                                placeholder="10001"
                                value={formData.zipcode}
                                onChange={onInputChange}
                                required
                            />
                        </div>
                    </div>
                </>
            )}
            </div>
        </>
    );
};

export default PaymentForm;

