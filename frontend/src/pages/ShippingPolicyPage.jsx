import React from 'react';
import styles from './shippingPolicyPage.module.css';

const ShippingPolicyPage = () => {
    return (
        <div className={styles.shippingPolicyPage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Shipping Policy</h1>
                    <p className={styles.lastUpdated}>Last updated: January 2025</p>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2>1. Overview</h2>
                        <p>
                            At XsneaKers, we strive to provide fast, reliable, and secure shipping for all your sneaker needs. This shipping policy outlines our shipping methods, delivery times, costs, and what you can expect when ordering from us.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Shipping Methods</h2>
                        
                        <h3>2.1 Standard Shipping</h3>
                        <ul>
                            <li><strong>Delivery Time:</strong> 5-7 business days</li>
                            <li><strong>Cost:</strong> $8.99</li>
                            <li><strong>Tracking:</strong> Included</li>
                            <li><strong>Signature Required:</strong> No</li>
                        </ul>

                        <h3>2.2 Express Shipping</h3>
                        <ul>
                            <li><strong>Delivery Time:</strong> 2-3 business days</li>
                            <li><strong>Cost:</strong> $15.99</li>
                            <li><strong>Tracking:</strong> Included</li>
                            <li><strong>Signature Required:</strong> No</li>
                        </ul>

                        <h3>2.3 Overnight Shipping</h3>
                        <ul>
                            <li><strong>Delivery Time:</strong> 1 business day</li>
                            <li><strong>Cost:</strong> $29.99</li>
                            <li><strong>Tracking:</strong> Included</li>
                            <li><strong>Signature Required:</strong> Yes</li>
                        </ul>

                        <h3>2.4 Free Shipping</h3>
                        <p>Free standard shipping is available on orders over $150.00.</p>
                    </section>

                    <section className={styles.section}>
                        <h2>3. Processing Time</h2>
                        <p>
                            Orders are typically processed and shipped within 1-2 business days after payment confirmation. Processing times may be extended during peak seasons, holidays, or promotional periods.
                        </p>
                        <p><strong>Note:</strong> Orders placed after 2:00 PM EST will be processed the next business day.</p>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Shipping Destinations</h2>
                        <p>We currently ship to the following locations:</p>
                        
                        <h3>4.1 Domestic Shipping (United States)</h3>
                        <ul>
                            <li>All 50 states</li>
                            <li>Washington D.C.</li>
                            <li>U.S. territories (Puerto Rico, Guam, U.S. Virgin Islands)</li>
                        </ul>

                        <h3>4.2 International Shipping</h3>
                        <p>We currently do not offer international shipping. We apologize for any inconvenience.</p>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Order Tracking</h2>
                        <p>
                            Once your order ships, you will receive a confirmation email with tracking information. You can also track your order through your account dashboard.
                        </p>
                        <p>Tracking information typically becomes available within 24 hours of shipment.</p>
                    </section>

                    <section className={styles.section}>
                        <h2>6. Delivery Information</h2>
                        
                        <h3>6.1 Delivery Attempts</h3>
                        <p>Our shipping partners will make up to 3 delivery attempts. If delivery is unsuccessful:</p>
                        <ul>
                            <li>Packages will be held at the local post office or shipping facility</li>
                            <li>You will receive a notification with pickup instructions</li>
                            <li>Packages will be held for 5-7 days before being returned</li>
                        </ul>

                        <h3>6.2 Delivery Address</h3>
                        <p>Please ensure your delivery address is complete and accurate. We are not responsible for delays or failed deliveries due to incorrect address information.</p>

                        <h3>6.3 Business Hours</h3>
                        <p>Deliveries are made during regular business hours (Monday-Friday, 8:00 AM - 6:00 PM). Weekend deliveries may be available for express and overnight shipping.</p>
                    </section>

                    <section className={styles.section}>
                        <h2>7. Shipping Restrictions</h2>
                        <p>Some items may have shipping restrictions:</p>
                        <ul>
                            <li>Limited edition releases may have delayed shipping</li>
                            <li>Pre-order items will ship on or after the release date</li>
                            <li>Custom or personalized items may require additional processing time</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>8. Shipping Delays</h2>
                        <p>While we strive for timely delivery, shipping delays may occur due to:</p>
                        <ul>
                            <li>Weather conditions</li>
                            <li>Holiday periods</li>
                            <li>High order volume</li>
                            <li>Shipping carrier delays</li>
                            <li>Customs processing (if applicable)</li>
                        </ul>
                        <p>We will notify you of any significant delays and provide updated tracking information.</p>
                    </section>

                    <section className={styles.section}>
                        <h2>9. Damaged or Lost Packages</h2>
                        
                        <h3>9.1 Damaged Packages</h3>
                        <p>If your package arrives damaged:</p>
                        <ul>
                            <li>Do not accept the package if damage is visible</li>
                            <li>Take photos of the damage</li>
                            <li>Contact us within 24 hours of delivery</li>
                            <li>We will arrange for a replacement or refund</li>
                        </ul>

                        <h3>9.2 Lost Packages</h3>
                        <p>If your package is lost in transit:</p>
                        <ul>
                            <li>Contact us after 7 days for standard shipping</li>
                            <li>Contact us after 3 days for express shipping</li>
                            <li>Contact us after 1 day for overnight shipping</li>
                            <li>We will investigate and provide a replacement or refund</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>10. Returns and Exchanges</h2>
                        <p>
                            For information about returns and exchanges, please refer to our <a href="/refund-policy" className={styles.link}>Refund Policy</a>. Return shipping costs and procedures are outlined there.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>11. Contact Information</h2>
                        <p>
                            If you have questions about shipping or need assistance with your order, please contact us:
                        </p>
                        <div className={styles.contactInfo}>
                            <p><strong>Email:</strong> shipping@xsneakers.com</p>
                            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                            <p><strong>Hours:</strong> Monday-Friday, 9:00 AM - 6:00 PM EST</p>
                            <p><strong>Address:</strong> 123 Sneaker Street, Fashion District, NY 10001</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicyPage;
