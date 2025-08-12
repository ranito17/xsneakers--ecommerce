import React from 'react';
import ContactForm from '../components/contactForm/ContactForm';
import styles from './pages.module.css';

const ContactSupportPage = () => {
    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div className={styles.pageTitle}>
                    <h1>Contact Support</h1>
                    <p>Get in touch with our support team</p>
                </div>
            </div>

            <div className={styles.pageContent}>
                <div className={styles.contactContainer}>
                    <div className={styles.contactIntro}>
                        <div className={styles.introContent}>
                            <h2>Need Help? We're Here!</h2>
                            <p>
                                Have a question about your order, need help with a product, or want to share feedback? 
                                Our support team is ready to assist you. We typically respond within 24 hours during business days.
                            </p>
                            
                            <div className={styles.features}>
                                <div className={styles.feature}>
                                    <span className={styles.featureIcon}>⚡</span>
                                    <div>
                                        <h4>Quick Response</h4>
                                        <p>We aim to respond within 24 hours</p>
                                    </div>
                                </div>
                                <div className={styles.feature}>
                                    <span className={styles.featureIcon}>🛡️</span>
                                    <div>
                                        <h4>Secure Communication</h4>
                                        <p>Your information is safe with us</p>
                                    </div>
                                </div>
                                <div className={styles.feature}>
                                    <span className={styles.featureIcon}>💬</span>
                                    <div>
                                        <h4>Multiple Channels</h4>
                                        <p>Email, phone, and live chat available</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <ContactForm />
                    </div>
                </div>

                <div className={styles.faqSection}>
                    <h2>Frequently Asked Questions</h2>
                    <div className={styles.faqGrid}>
                        <div className={styles.faqItem}>
                            <h3>How do I track my order?</h3>
                            <p>You can track your order by logging into your account and visiting the "My Orders" section. You'll receive email updates as your order progresses.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <h3>What is your return policy?</h3>
                            <p>We offer a 30-day return policy for most items. Products must be in original condition with all tags attached. Contact us for return authorization.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <h3>Do you ship internationally?</h3>
                            <p>Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. Check our shipping page for details.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <h3>How can I change my order?</h3>
                            <p>Orders can be modified within 2 hours of placement. Contact our support team immediately if you need to make changes to your order.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <h3>What payment methods do you accept?</h3>
                            <p>We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely through our trusted payment partners.</p>
                        </div>
                        <div className={styles.faqItem}>
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
