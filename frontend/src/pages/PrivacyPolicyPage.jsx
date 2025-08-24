import React from 'react';
import styles from './privacyPolicyPage.module.css';

const PrivacyPolicyPage = () => {
    return (
        <div className={styles.privacyPolicyPage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Privacy Policy</h1>
                    <p className={styles.lastUpdated}>Last updated: January 2025</p>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2>1. Introduction</h2>
                        <p>
                            Welcome to XsneaKers ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, make purchases, or interact with our services.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Information We Collect</h2>
                        
                        <h3>2.1 Personal Information</h3>
                        <p>We may collect the following personal information:</p>
                        <ul>
                            <li>Name and contact information (email address, phone number)</li>
                            <li>Billing and shipping addresses</li>
                            <li>Payment information (processed securely through our payment partners)</li>
                            <li>Account credentials and preferences</li>
                            <li>Order history and purchase behavior</li>
                        </ul>

                        <h3>2.2 Automatically Collected Information</h3>
                        <p>When you visit our website, we automatically collect:</p>
                        <ul>
                            <li>IP address and device information</li>
                            <li>Browser type and version</li>
                            <li>Operating system</li>
                            <li>Pages visited and time spent</li>
                            <li>Referring website</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>3. How We Use Your Information</h2>
                        <p>We use the collected information for the following purposes:</p>
                        <ul>
                            <li>Process and fulfill your orders</li>
                            <li>Communicate with you about your account and orders</li>
                            <li>Send marketing communications (with your consent)</li>
                            <li>Improve our website and services</li>
                            <li>Prevent fraud and ensure security</li>
                            <li>Comply with legal obligations</li>
                            <li>Provide customer support</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Information Sharing and Disclosure</h2>
                        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
                        <ul>
                            <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our website, processing payments, and delivering orders</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                            <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                        </p>
                        <ul>
                            <li>SSL encryption for data transmission</li>
                            <li>Secure payment processing</li>
                            <li>Regular security assessments</li>
                            <li>Access controls and authentication</li>
                            <li>Data backup and recovery procedures</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>6. Cookies and Tracking Technologies</h2>
                        <p>
                            We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can control cookie settings through your browser preferences.
                        </p>
                        <p>Types of cookies we use:</p>
                        <ul>
                            <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                            <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
                            <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>7. Your Rights and Choices</h2>
                        <p>You have the following rights regarding your personal information:</p>
                        <ul>
                            <li><strong>Access:</strong> Request access to your personal information</li>
                            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                            <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                            <li><strong>Restriction:</strong> Request restriction of processing</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>8. Children's Privacy</h2>
                        <p>
                            Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>9. International Data Transfers</h2>
                        <p>
                            Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>10. Changes to This Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>11. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                        </p>
                        <div className={styles.contactInfo}>
                            <p><strong>Email:</strong> privacy@xsneakers.com</p>
                            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                            <p><strong>Address:</strong> 123 Sneaker Street, Fashion District, NY 10001</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
