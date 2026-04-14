// ShippingPolicyPage.jsx
import React from 'react';
import styles from './pages.module.css';
import { useSettings } from '../context/SettingsProvider';
import { formatPrice } from '../utils/price.utils';

const ShippingPolicyPage = () => {
    const { 
        settings, 
        loading
    } = useSettings();

    const deliveryCost = settings?.default_delivery_cost || 0;
    const freeDeliveryThreshold = settings?.free_delivery_threshold || 0;
    const currency = settings?.currency || 'ILS';
    return (
        <div className={styles.aboutUsPage}>
            {/* Hero Section */}
            <div className={styles.aboutHeroSection}>
                <div className={styles.aboutHeroContent}>
                    <h1 className={styles.aboutHeroTitle}>Delivery Policy</h1>
                    <p className={styles.aboutHeroSubtitle}>
                        Fast, reliable delivery throughout Israel with transparent pricing and tracking.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.aboutMainContent}>
                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>1. Overview</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryText}>
                        <p>
                            At XsneaKers, we are based in Israel and provide fast, reliable delivery services throughout the country. This delivery policy outlines our delivery methods, costs, and what you can expect when ordering from us.
                        </p>
                    </div>
                </div>

                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>2. Delivery Methods</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryText}>
                        {loading ? (
                            <p>Loading delivery information...</p>
                        ) : (
                            <>
                                                                 <h3 style={{ color: 'var(--primary-color)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>2.1 Standard Delivery</h3>
                                 <ul>
                                     <li><strong>Estimated Delivery Time:</strong> 2 weeks</li>
                                     <li><strong>Cost:</strong> {formatPrice(deliveryCost, currency)}</li>
                                     <li><strong>Tracking:</strong> Included</li>
                                 </ul>

                                 <h3 style={{ color: 'var(--primary-color)', fontSize: '1.1rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>2.2 Free Delivery</h3>
                                 <p>Free delivery is available on orders over {formatPrice(freeDeliveryThreshold, currency)}.</p>
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>3. Processing Time</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryText}>
                        <p>
                            Orders are typically processed and shipped within 1-2 business days after payment confirmation. Processing times may be extended during peak seasons, holidays, or promotional periods.
                        </p>
                        <p><strong>Note:</strong> Orders placed after 2:00 PM Israel time will be processed the next business day.</p>
                    </div>
                </div>

                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>4. Delivery Destinations</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryText}>
                        <p>We currently deliver to all locations within Israel.</p>
                        <p><strong>Note:</strong> We do not offer international delivery at this time.</p>
                    </div>
                </div>

                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>5. Order Tracking</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryText}>
                        <p>
                            Once your order ships, you will receive a confirmation email with tracking information. You can also track your order through your account dashboard in the Orders page.
                        </p>
                        <p>Tracking information typically becomes available within 24 hours of shipment.</p>
                    </div>
                </div>

                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>6. Damaged or Lost Packages</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryText}>
                        <h3 style={{ color: 'var(--primary-color)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>6.1 Damaged Packages</h3>
                        <p>If your package arrives damaged:</p>
                        <ul>
                            <li>Do not accept the package if damage is visible</li>
                            <li>Take photos of the damage</li>
                            <li>Contact us within 24 hours of delivery</li>
                            <li>We will arrange for a replacement or refund</li>
                        </ul>

                        <h3 style={{ color: 'var(--primary-color)', fontSize: '1.1rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>6.2 Lost Packages</h3>
                        <p>If your package is lost in transit:</p>
                        <ul>
                            <li>Contact us after 14 days for standard delivery</li>
                            <li>We will investigate and provide a replacement or refund</li>
                        </ul>
                    </div>
                </div>

                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>7. Returns and Exchanges</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryText}>
                        <p>
                            Our refund policy requires items to be returned exactly as received, with the original price tag attached. The return process is handled outside our website through direct communication.
                        </p>
                        <p>
                            <strong>Return Process:</strong>
                        </p>
                        <ul>
                            <li>Customer must email us first to initiate the return process</li>
                            <li>Our admin team will guide you through the complete return procedure</li>
                            <li>Items must be returned in original condition with price tag attached</li>
                            <li>Return delivery costs are the responsibility of the customer</li>
                        </ul>
                      
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicyPage;
