// MessageComposer.jsx
import React, { useState } from 'react';
import { validateMessageComposerForm } from '../../../utils/form.validation';
import styles from './messages.module.css';

const MessageComposer = ({ onSend, onCancel }) => {
    const [formData, setFormData] = useState({
        messageType: 'admin_to_admin',
        recipientEmail: '',
        recipientName: '',
        subject: '',
        message: '',
        priority: 'normal'
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate form
        const validation = validateMessageComposerForm(formData);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        
        // Clear errors and send
        setErrors({});
        onSend(formData);
    };

    // Quick templates
    const applyTemplate = (type) => {
        const templates = {
            lowStock: {
                subject: 'Low Stock Alert',
                message: 'Dear Supplier,\n\nWe are running low on the following product:\n\nProduct: [PRODUCT NAME]\nCurrent Stock: [QUANTITY]\n\nPlease arrange for restocking at your earliest convenience.\n\nBest regards,\nxSneakers Team'
            },
            orderIssue: {
                subject: 'Stock Refill Request',
                message: 'Dear Supplier,\n\nWe need to restock the following items:\n\n[LIST ITEMS HERE]\n\nPlease confirm availability and delivery timeline.\n\nThank you,\nxSneakers Team'
            },
            general: {
                subject: '',
                message: ''
            }
        };

        const template = templates[type] || templates.general;
        setFormData(prev => ({
            ...prev,
            subject: template.subject,
            message: template.message
        }));
    };

    return (
        <div className={styles.composerContainer}>
            <div className={styles.composerHeader}>
                <h2 className={styles.composerTitle}>
                    ✉️ Compose New Message
                </h2>
                <button 
                    onClick={onCancel}
                    className={styles.closeButton}
                >
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.composerForm}>
                {/* Message Type */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        Message Type *
                    </label>
                    <select
                        name="messageType"
                        value={formData.messageType}
                        onChange={handleChange}
                        className={styles.formSelect}
                        required
                    >
                        <option value="admin_to_admin">👨‍💼 Admin to Admin</option>
                        <option value="admin_to_supplier">📦 Admin to Supplier</option>
                        <option value="low_stock_alert">⚠️ Low Stock Alert</option>
                    </select>
                </div>

                {/* Quick Templates */}
                {formData.messageType === 'admin_to_supplier' && (
                    <div className={styles.templatesSection}>
                        <label className={styles.formLabel}>
                            Quick Templates:
                        </label>
                        <div className={styles.templateButtons}>
                            <button
                                type="button"
                                onClick={() => applyTemplate('lowStock')}
                                className={styles.templateButton}
                            >
                                Low Stock Alert
                            </button>
                            <button
                                type="button"
                                onClick={() => applyTemplate('replyToAll')}
                                className={styles.templateButton}
                            >
                                reply to all
                            </button>
                            <button
                                type="button"
                                onClick={() => applyTemplate('orderIssue')}
                                className={styles.templateButton}
                            >
                                Stock Refill Request
                            </button>
                            
                        </div>
                    </div>
                )}

                {/* Recipient Email */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        Recipient Email *
                    </label>
                    <input
                        type="email"
                        name="recipientEmail"
                        value={formData.recipientEmail}
                        onChange={handleChange}
                        className={`${styles.formInput} ${errors.recipientEmail ? styles.formInputError : ''}`}
                        placeholder={
                            formData.messageType === 'admin_to_supplier' 
                                ? 'supplier@example.com' 
                                : 'admin@xsneakers.com'
                        }
                        required
                    />
                    {errors.recipientEmail && (
                        <span className={styles.errorText}>
                            {errors.recipientEmail}
                        </span>
                    )}
                </div>

                {/* Recipient Name */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        Recipient Name
                    </label>
                    <input
                        type="text"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleChange}
                        className={`${styles.formInput} ${errors.recipientName ? styles.formInputError : ''}`}
                        placeholder="Supplier Name or Admin Name"
                    />
                    {errors.recipientName && (
                        <span className={styles.errorText}>
                            {errors.recipientName}
                        </span>
                    )}
                </div>

                {/* Priority */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        Priority *
                    </label>
                    <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className={styles.formSelect}
                        required
                    >
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                {/* Subject */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        Subject *
                    </label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`${styles.formInput} ${errors.subject ? styles.formInputError : ''}`}
                        placeholder="Message subject"
                        required
                    />
                    {errors.subject && (
                        <span className={styles.errorText}>
                            {errors.subject}
                        </span>
                    )}
                </div>

                {/* Message */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                        Message *
                    </label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className={`${styles.formTextarea} ${errors.message ? styles.formTextareaError : ''}`}
                        rows="10"
                        placeholder="Type your message here..."
                        required
                    />
                    <div className={styles.charCount}>
                        {formData.message.length} characters
                    </div>
                    {errors.message && (
                        <span className={styles.errorText}>
                            {errors.message}
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className={styles.formActions}>
                    <button
                        type="button"
                        onClick={onCancel}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                    >
                        📤 Send Message
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MessageComposer;

