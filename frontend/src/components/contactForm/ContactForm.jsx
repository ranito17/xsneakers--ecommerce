import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuthentication';
import styles from './contactForm.module.css';
import ErrorContainer from '../error/ErrorContainer';

const ContactForm = () => {
    const { user, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        name: isAuthenticated ? user?.name || '' : '',
        email: isAuthenticated ? user?.email || '' : '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Client-side validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
            setError('All fields are required.');
            setLoading(false);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
        }

        try {
            // Simulate API call with delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simulate successful submission
            console.log('Contact form submitted:', formData);
            
            setSuccess(true);
            setFormData({
                name: isAuthenticated ? user?.name || '' : '',
                email: isAuthenticated ? user?.email || '' : '',
                subject: '',
                message: ''
            });
        } catch (error) {
            setError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className={styles.authRequired}>
                <div className={styles.authMessage}>
                    <h3>🔐 Authentication Required</h3>
                    <p>Please log in to contact our support team.</p>
                    <button className={styles.loginButton}>
                        Log In to Contact Support
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.contactForm}>
            <div className={styles.formHeader}>
                <h2>Contact Support</h2>
                <p>We're here to help! Send us a message and we'll get back to you as soon as possible.</p>
            </div>

            {success && (
                <div className={styles.successMessage}>
                    <span className={styles.successIcon}>✅</span>
                    <div>
                        <h3>Message Sent Successfully!</h3>
                        <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
                    </div>
                </div>
            )}

            {error && (
                <ErrorContainer error={error} />
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isAuthenticated}
                        className={isAuthenticated ? styles.disabledInput : ''}
                    />
                    {isAuthenticated && (
                        <small className={styles.helpText}>
                            Using your account name: {user?.name}
                        </small>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isAuthenticated}
                        className={isAuthenticated ? styles.disabledInput : ''}
                    />
                    {isAuthenticated && (
                        <small className={styles.helpText}>
                            Using your account email: {user?.email}
                        </small>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="subject">Subject *</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="What can we help you with?"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="message">Message *</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows="6"
                        placeholder="Please describe your issue or question in detail..."
                    />
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

            <div className={styles.contactInfo}>
                <h3>Other Ways to Reach Us</h3>
                <div className={styles.contactMethods}>
                    <div className={styles.contactMethod}>
                        <span className={styles.methodIcon}>📧</span>
                        <div>
                            <h4>Email</h4>
                            <p>support@yourstore.com</p>
                        </div>
                    </div>
                    <div className={styles.contactMethod}>
                        <span className={styles.methodIcon}>📞</span>
                        <div>
                            <h4>Phone</h4>
                            <p>+1 (555) 123-4567</p>
                        </div>
                    </div>
                    <div className={styles.contactMethod}>
                        <span className={styles.methodIcon}>💬</span>
                        <div>
                            <h4>Live Chat</h4>
                            <p>Available 24/7</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;
