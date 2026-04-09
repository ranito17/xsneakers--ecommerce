import React from 'react';
import styles from './contactForm.module.css';
import { ErrorContainer } from '.';

const ContactForm = ({
    formData = {},
    fieldErrors = {},
    loading = false,
    error = null,
    success = false,
    isAuthenticated = false,
    user = null,
    onInputChange,
    onBlur,
    onSubmit
}) => {
    const {
        name = '',
        email = '',
        phone = '',
        subject = '',
        message = ''
    } = formData;

    return (
        <div className={styles.contactForm}>
            <div className={styles.formHeader}>
                <h2>Contact Support</h2>
                <p>We're here to help! Send us a message and we'll get back to you as soon as possible.</p>
            </div>

            {error && (
                <ErrorContainer error={error} />
            )}

            <form onSubmit={onSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={onInputChange}
                        onBlur={onBlur}
                        placeholder="Your full name"
                        className={fieldErrors.name ? styles.errorInput : ''}
                        disabled={isAuthenticated && user?.full_name}
                    />
                    {fieldErrors.name && (
                        <span className={styles.fieldError}>{fieldErrors.name}</span>
                    )}
                    {isAuthenticated && user?.full_name && (
                        <span className={styles.fieldInfo}>✓ Using your account name</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onInputChange}
                        onBlur={onBlur}
                        placeholder="your.email@example.com"
                        className={fieldErrors.email ? styles.errorInput : ''}
                        disabled={isAuthenticated && user?.email}
                    />
                    {fieldErrors.email && (
                        <span className={styles.fieldError}>{fieldErrors.email}</span>
                    )}
                    {isAuthenticated && user?.email && (
                        <span className={styles.fieldInfo}>✓ Using your account email</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="subject">Subject *</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={subject}
                        onChange={onInputChange}
                        onBlur={onBlur}
                        placeholder="What can we help you with?"
                        className={fieldErrors.subject ? styles.errorInput : ''}
                    />
                    {fieldErrors.subject && (
                        <span className={styles.fieldError}>{fieldErrors.subject}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="message">Message *</label>
                    <textarea
                        id="message"
                        name="message"
                        value={message}
                        onChange={onInputChange}
                        onBlur={onBlur}
                        rows="6"
                        placeholder="Please describe your issue or question in detail..."
                        className={fieldErrors.message ? styles.errorInput : ''}
                    />
                    {fieldErrors.message && (
                        <span className={styles.fieldError}>{fieldErrors.message}</span>
                    )}
                </div>

                <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className={styles.loadingSpinner}></span>
                            Sending Message...
                        </>
                    ) : (
                        'Send Message'
                    )}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;
