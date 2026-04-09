// PrivacyPolicyPage.jsx
import React from 'react';
import styles from './pages.module.css';

const PrivacyPolicyPage = () => {
    return (
        <div className={styles.aboutUsPage}>
            {/* Hero Section */}
            <div className={styles.aboutHeroSection}>
                <div className={styles.aboutHeroContent}>
                    <h1 className={styles.aboutHeroTitle}>Privacy Policy</h1>
                    <p className={styles.aboutHeroSubtitle}>
                        Your privacy is important to us. Learn how we collect, use, and protect your information.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.aboutMainContent}>
                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>1. Information We Collect</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryText}>
                        <p>We collect the following information:</p>
                        <ul>
                            <li>Name and contact information (email address, phone number)</li>
                            <li>Billing and shipping addresses</li>
                            <li>Account credentials and preferences</li>
                            <li>Order history and purchase behavior</li>
                            <li>IP address and device information</li>
                            <li>Pages visited and time spent on our website</li>
                        </ul>
                        <p><strong>Important:</strong> We do not store or save your payment information. All payments are processed securely through our trusted payment partners.</p>
                    </div>
                </div>

                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>2. How We Use Your Information</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryText}>
                        <p>We use your information to:</p>
                        <ul>
                            <li>Process and fulfill your orders</li>
                            <li>Communicate with you about your account and orders</li>
                            <li>Send marketing communications (with your consent)</li>
                            <li>Improve our website and services</li>
                            <li>Prevent fraud and ensure security</li>
                            <li>Provide customer support</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>3. Information Sharing</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryText}>
                        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only with:</p>
                        <ul>
                            <li>Trusted service providers who help us operate our website and deliver orders</li>
                            <li>When required by law or to protect our rights and safety</li>
                            <li>With your explicit consent for specific purposes</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>4. Data Security</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryText}>
                        <p>We protect your information with:</p>
                        <ul>
                            <li>SSL encryption for data transmission</li>
                            <li>Secure payment processing through trusted partners</li>
                            <li>Regular security assessments</li>
                            <li>Access controls and authentication</li>
                        </ul>
                    </div>
                </div>

              
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
