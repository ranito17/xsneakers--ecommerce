// ContactSupportPage.jsx
import React, { useEffect, useState } from 'react';
import ContactForm from '../components/contactForm/ContactForm';
import { useAuth } from '../hooks/useAuthentication';
import { useToast } from '../components/common/toast';
import { messageApi } from '../services';
import { validateContactForm, validateContactField } from '../utils/form.validation';
import styles from './pages.module.css';

const ContactSupportPage = () => {
    const { user, isAuthenticated } = useAuth();
    const { showSuccess, showError } = useToast();
    const [formData, setFormData] = useState({
        name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone_number || '',
        subject: '',
        message: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Prefill form when auth state changes
    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                name: user.full_name || prev.name,
                email: user.email || prev.email,
                phone: user.phone_number || prev.phone
            }));
        }
    }, [isAuthenticated, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (touchedFields[name]) {
            const validation = validateContactField(name, value);
            setFieldErrors(prev => ({
                ...prev,
                [name]: validation.isValid ? '' : validation.message
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouchedFields(prev => ({
            ...prev,
            [name]: true
        }));

        const validation = validateContactField(name, value);
        setFieldErrors(prev => ({
            ...prev,
            [name]: validation.isValid ? '' : validation.message
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        setTouchedFields({
            name: true,
            email: true,
            subject: true,
            message: true
        });

        const validation = validateContactForm(formData);

        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            setError('Please fix the errors below.');
            setLoading(false);
            return;
        }

        try {
            const messageType = isAuthenticated ? 'customer_to_admin' : 'guest_to_admin';

            const response = await messageApi.createMessage({
                messageType,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                subject: formData.subject,
                message: formData.message
            });

            if (response.success) {
                setSuccess(true);
                showSuccess('Message sent successfully!');
                setFormData({
                    name: user?.full_name || '',
                    email: user?.email || '',
                    phone: user?.phone_number || '',
                    subject: '',
                    message: ''
                });
                setFieldErrors({});
                setTouchedFields({});
            } else {
                setError(response.message || 'Failed to send message. Please try again.');
                showError(response.message || 'Failed to send message. Please try again.');
            }
        } catch (submitError) {
            console.error('Error submitting contact form:', submitError);
            setError('Failed to send message. Please try again.');
            showError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.contactPage}>
            {/* Page Header */}
            

            {/* Main Content */}
            <div className={styles.contactPageContent}>
                <div className={styles.contactContainer}>
                  

                    {/* Contact Form Section */}
                    <div className={styles.contactFormSection}>
                        <ContactForm
                            formData={formData}
                            fieldErrors={fieldErrors}
                            loading={loading}
                            error={error}
                            success={success}
                            isAuthenticated={isAuthenticated}
                            user={user}
                            onInputChange={handleInputChange}
                            onBlur={handleBlur}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>

                {/* FAQ Section */}
                <div className={styles.contactFaqSection}>
                    <h2>Frequently Asked Questions</h2>
                    <div className={styles.contactFaqGrid}>
                        <div className={styles.contactFaqItem}>
                            <h3>How do I track my order?</h3>
                            <p>You can track your order by logging into your account and visiting the "My Orders" section. You'll receive email updates as your order progresses.</p>
                        </div>
                        <div className={styles.contactFaqItem}>
                            <h3>What is your return policy?</h3>
                            <p>We offer a 30-day return policy for most items. Products must be in original condition with all tags attached. Contact us for return authorization.</p>
                        </div>
                        <div className={styles.contactFaqItem}>
                            <h3>Do you ship internationally?</h3>
                            <p>Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. Check our shipping page for details.</p>
                        </div>
                        <div className={styles.contactFaqItem}>
                            <h3>How can I change my order?</h3>
                            <p>Orders can be modified within 2 hours of placement. Contact our support team immediately if you need to make changes to your order.</p>
                        </div>
                        <div className={styles.contactFaqItem}>
                            <h3>What payment methods do you accept?</h3>
                            <p>We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely through our trusted payment partners.</p>
                        </div>
                        <div className={styles.contactFaqItem}>
                            <h3>Is my personal information secure?</h3>
                            <p>Absolutely! We use industry-standard encryption and security measures to protect your personal and payment information.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactSupportPage;
