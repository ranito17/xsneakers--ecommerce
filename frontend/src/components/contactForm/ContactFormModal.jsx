// ContactFormModal.jsx - Reusable contact form for multiple contexts
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuthentication';
import { useSettings } from '../../context/SettingsProvider';
import { validateContactForm, validateContactField } from '../../utils/form.validation';
import styles from './contactFormModal.module.css';

/**
 * Reusable Contact Form Modal
 * 
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Close handler
 * @param {function} onSubmit - Submit handler (receives formData)
 * @param {string} type - Form type: 'guest', 'customer', 'customer_urgent', 'admin_to_supplier'
 * @param {object} initialData - Pre-fill data (orderId, orderNumber, etc.)
 */
const ContactFormModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    type = 'guest',
    initialData = {} 
}) => {
    const { user } = useAuth();
    const { settings } = useSettings();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        recipientEmail: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-fill form based on user and type
    useEffect(() => {
        if (isOpen) {
            const defaultData = {
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone_number || '',
                subject: initialData.subject || '',
                message: initialData.message || '',
                recipientEmail: initialData.recipientEmail || ''
            };

            // Auto-fill subject for urgent messages
            if (type === 'customer_urgent' && initialData.orderNumber) {
                defaultData.subject = `URGENT: Issue with Order ${initialData.orderNumber}`;
            }

            // Auto-fill supplier email from settings for admin-to-supplier
            if (type === 'admin_to_supplier' && settings?.supplier_email) {
                defaultData.recipientEmail = settings.supplier_email;
            }

            setFormData(defaultData);
            setErrors({});
        }
    }, [isOpen, user, type, initialData, settings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Real-time validation using centralized validators
        if (errors[name]) {
            const fieldValidation = validateContactField(name, value);
            setErrors(prev => ({ 
                ...prev, 
                [name]: fieldValidation.isValid ? '' : fieldValidation.message 
            }));
        }
    };

    const validate = () => {
        // Use centralized validation from validators.js
        const validation = validateContactForm(formData);
        const newErrors = { ...validation.errors };

        // Additional validation for recipient email (admin messages)
        if ((type === 'admin_to_supplier' || type === 'reply') && !formData.recipientEmail.trim()) {
            newErrors.recipientEmail = 'Recipient email is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Determine actual message type based on user and context
            let actualMessageType = type;
            
            // If type is generic (from contact page), determine based on user
            if (type === 'guest' || type === 'customer') {
                actualMessageType = user ? 'customer_to_admin' : 'guest_to_admin';
            }
            // customer_urgent becomes customer_to_admin_urgent
            if (type === 'customer_urgent') {
                actualMessageType = 'customer_to_admin_urgent';
            }
            // admin types stay as is
            
            // Pass data to parent with message type
            await onSubmit({
                ...formData,
                messageType: actualMessageType,
                orderId: initialData.orderId || null,
                productId: initialData.productId || null
            });
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
                recipientEmail: ''
            });
            
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrors({ submit: 'Failed to send message. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getModalTitle = () => {
        const titles = {
            'guest': '✉️ Contact Us',
            'customer': '✉️ Contact Support',
            'customer_urgent': '🚨 Report Issue',
            'admin_to_supplier': '📦 Message to Supplier',
            'reply': '📧 Reply to Customer'
        };
        return titles[type] || '✉️ Contact Form';
    };

    const getPlaceholders = () => {
        if (type === 'customer_urgent') {
            return {
                subject: 'Describe the issue with your order',
                message: 'Please describe the issue in detail. Include any relevant information about the product, damage, or problem.'
            };
        }
        if (type === 'admin_to_supplier') {
            return {
                subject: 'Stock Request / Order',
                message: 'Dear Supplier,\n\nWe need to restock the following items:\n\n[Details here]\n\nBest regards'
            };
        }
        if (type === 'reply') {
            return {
                subject: 'Reply subject',
                message: 'Your reply to the customer...'
            };
        }
        return {
            subject: 'What is your message about?',
            message: 'Please describe your inquiry or feedback...'
        };
    };

    if (!isOpen) return null;

    const placeholders = getPlaceholders();
    const showPhone = type !== 'admin_to_supplier' && type !== 'reply';
    const showRecipient = type === 'admin_to_supplier' || type === 'reply';
    const isReply = type === 'reply';

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2>{getModalTitle()}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Name & Email */}
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Your Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? styles.inputError : ''}
                                placeholder="John Doe"
                                disabled={user?.name}
                            />
                            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                            {user?.name && (
                                <span className={styles.infoText}>✓ Using your account name</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Your Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? styles.inputError : ''}
                                placeholder="john@example.com"
                                disabled={user?.email}
                            />
                            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                            {user?.email && (
                                <span className={styles.infoText}>✓ Using your account email</span>
                            )}
                        </div>
                    </div>

                    {/* Phone & Recipient */}
                    {(showPhone || showRecipient) && (
                        <div className={styles.formRow}>
                            {showPhone && (
                                <div className={styles.formGroup}>
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="0501234567"
                                    />
                                </div>
                            )}

                            {showRecipient && (
                                <div className={styles.formGroup}>
                                    <label>Recipient Email *</label>
                                    <input
                                        type="email"
                                        name="recipientEmail"
                                        value={formData.recipientEmail}
                                        onChange={handleChange}
                                        className={errors.recipientEmail ? styles.inputError : ''}
                                        placeholder={
                                            type === 'admin_to_supplier' 
                                                ? 'supplier@example.com'
                                                : 'customer@example.com'
                                        }
                                        disabled={type === 'admin_to_supplier'}
                                    />
                                    {errors.recipientEmail && <span className={styles.errorText}>{errors.recipientEmail}</span>}
                                    {type === 'admin_to_supplier' && settings?.supplier_email && (
                                        <span className={styles.infoText}>✓ Sending to supplier: {settings.supplier_email}</span>
                                    )}
                                    {isReply && (
                                        <span className={styles.infoText}>✓ Replying to customer</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Order Info Display (if urgent) */}
                    {type === 'customer_urgent' && initialData.orderNumber && (
                        <div className={styles.orderInfo}>
                            <strong>📦 Order:</strong> {initialData.orderNumber}
                        </div>
                    )}

                    {/* Subject */}
                    <div className={styles.formGroup}>
                        <label>Subject *</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className={errors.subject ? styles.inputError : ''}
                            placeholder={placeholders.subject}
                        />
                        {errors.subject && <span className={styles.errorText}>{errors.subject}</span>}
                    </div>

                    {/* Message */}
                    <div className={styles.formGroup}>
                        <label>Message *</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            className={errors.message ? styles.inputError : ''}
                            rows="6"
                            placeholder={placeholders.message}
                        />
                        {errors.message && <span className={styles.errorText}>{errors.message}</span>}
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className={styles.submitError}>
                            {errors.submit}
                        </div>
                    )}

                    {/* Actions */}
                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending...' : '📤 Send Message'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactFormModal;

