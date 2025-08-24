import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../services/settingsApi';
import { productApi } from '../../services/index';
import styles from './footer.module.css';

const Footer = () => {
    const [settings, setSettings] = useState({
        supplier_email: 'support@example.com',
        store_instagram: 'yourstore',
        store_whatsapp: '1234567890'
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
        fetchCategories();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await settingsApi.getPublicSettings();
            if (response.success && response.data) {
                setSettings(response.data);
            }
        } catch (error) {
            console.error('Error fetching footer settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await productApi.getCategories();
            if (response.success && response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching categories for footer:', error);
        }
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                {/* Main Footer Sections */}
                <div className={styles.footerSections}>
                    {/* Categories */}
                    <div className={styles.footerSection}>
                        <h3 className={styles.sectionTitle}>Categories</h3>
                        <ul className={styles.footerLinks}>
                            {categories.map((category) => (
                                <li key={category.category_id}>
                                    <a 
                                        href={`/products?category=${category.category_id}`} 
                                        className={styles.footerLink}
                                    >
                                        {category.category_name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div className={styles.footerSection}>
                        <h3 className={styles.sectionTitle}>Contact Us</h3>
               
                        <ul className={styles.footerLinks}>
                            <li><a href="/about" className={styles.footerLink}>About Us</a></li>
                            <li><a href="/contact" className={styles.footerLink}>Contact Support</a></li>
                            <li><a href={`mailto:${settings.supplier_email}`} className={styles.footerLink}>Email Us</a></li>
                            <li><a href={`https://instagram.com/${settings.store_instagram}`} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Contact on Instagram</a></li>
                            <li><a href={`https://wa.me/${settings.store_whatsapp}`} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Contact on WhatsApp</a></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div className={styles.footerSection}>
                        <h3 className={styles.sectionTitle}>Legal</h3>
                        <ul className={styles.footerLinks}>
                            <li><a href="/privacy-policy" className={styles.footerLink}>Privacy Policy</a></li>
                            <li><a href="/shipping-policy" className={styles.footerLink}>Shipping Policy</a></li>
                        </ul>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className={styles.paymentSection}>
                    <h4 className={styles.paymentTitle}>We Accept</h4>
                    <div className={styles.paymentMethods}>
                        <span className={styles.paymentMethod}>Visa</span>
                        <span className={styles.paymentMethod}>Mastercard</span>
                        <span className={styles.paymentMethod}>PayPal</span>
                        <span className={styles.paymentMethod}>Apple Pay</span>
                        <span className={styles.paymentMethod}>Google Pay</span>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className={styles.bottomFooter}>
                    <div className={styles.bottomFooterContent}>
                        <p className={styles.copyright}>
                            © 2025 Rani Tobassy & Shady Ghadban. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;