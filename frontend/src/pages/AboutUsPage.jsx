// AboutUsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './pages.module.css';

const AboutUsPage = () => {
    return (
        <div className={styles.aboutUsPage}>
            {/* Hero Section */}
            <div className={styles.aboutHeroSection}>
                <div className={styles.aboutHeroContent}>
                    <h1 className={styles.aboutHeroTitle}>About Us</h1>
                    <p className={styles.aboutHeroSubtitle}>
                        We're passionate about delivering quality products and exceptional service to our customers.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.aboutMainContent}>
                {/* Story Section */}
                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>Our Story</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutStoryContent}>
                        <div className={styles.aboutStoryText}>
                            <p>
                                Founded with a vision to provide high-quality sneakers at competitive prices,
                                XSneakers is a passion project built for sneaker lovers in Israel.
                                Our commitment to quality and customer satisfaction drives everything we do.
                            </p>
                            <p>
                                We believe in building lasting relationships with our customers through
                                transparent communication, reliable service, and products that exceed expectations.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mission Section */}
                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>Our Mission</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutMissionContent}>
                        <div className={styles.aboutMissionCard}>
                            <div className={styles.aboutMissionIcon}>🎯</div>
                            <h3 className={styles.aboutMissionTitle}>Quality & Service</h3>
                            <p className={styles.aboutMissionText}>
                                To provide exceptional products and outstanding customer service, 
                                making every interaction meaningful and every purchase valuable.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Values Section */}
                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>Our Values</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutValuesGrid}>
                        <div className={styles.aboutValueCard}>
                            <div className={styles.aboutValueIcon}>🤝</div>
                            <h3 className={styles.aboutValueTitle}>Trust</h3>
                            <p className={styles.aboutValueText}>
                                Building lasting relationships through honesty and reliability.
                            </p>
                        </div>
                        <div className={styles.aboutValueCard}>
                            <div className={styles.aboutValueIcon}>⭐</div>
                            <h3 className={styles.aboutValueTitle}>Quality</h3>
                            <p className={styles.aboutValueText}>
                                Delivering products that meet the highest standards.
                            </p>
                        </div>
                        <div className={styles.aboutValueCard}>
                            <div className={styles.aboutValueIcon}>💡</div>
                            <h3 className={styles.aboutValueTitle}>Innovation</h3>
                            <p className={styles.aboutValueText}>
                                Continuously improving and adapting to meet customer needs.
                            </p>
                        </div>
                        <div className={styles.aboutValueCard}>
                            <div className={styles.aboutValueIcon}>❤️</div>
                            <h3 className={styles.aboutValueTitle}>Care</h3>
                            <p className={styles.aboutValueText}>
                                Treating every customer with respect and attention.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Founder Section */}
                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>The Person Behind XSneakers</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutMissionContent}>
                        <div className={styles.aboutMissionCard}>
                            <div className={styles.aboutMemberAvatar} style={{ margin: '0 auto 1rem' }}>
                                <span className={styles.aboutAvatarInitial}>R</span>
                            </div>
                            <h3 className={styles.aboutMemberName}>Ranit</h3>
                            <p className={styles.aboutMemberRole}>Founder & Sole Owner</p>
                            <p className={styles.aboutMissionText}>
                                Hi, I'm Ranit — a passionate sneaker enthusiast based in Israel and the founder and sole person behind XSneakers.
                                I built this store out of my love for sneakers and my desire to make it easy for fellow sneaker fans in Israel to find premium kicks they'll love.
                                Every product, every decision, and every order is handled personally by me.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className={styles.aboutCtaSection}>
                    <h2 className={styles.aboutCtaTitle}>Ready to Get Started?</h2>
                    <p className={styles.aboutCtaText}>
                        Join our growing community of sneaker lovers across Israel.
                    </p>
                    <div className={styles.aboutCtaButtons}>
                        <Link to="/products" className={styles.aboutCtaButtonPrimary}>
                            Browse Products
                        </Link>
                        <Link to="/contact" className={styles.aboutCtaButtonSecondary}>
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;
