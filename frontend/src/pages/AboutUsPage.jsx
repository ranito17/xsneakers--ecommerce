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
                                Founded with a vision to provide high-quality products at competitive prices, 
                                we've grown from a small local business to serving customers nationwide. 
                                Our commitment to excellence and customer satisfaction drives everything we do.
                            </p>
                            <p>
                                We believe in building lasting relationships with our customers through 
                                transparent communication, reliable service, and products that exceed expectations.
                            </p>
                        </div>
                        <div className={styles.aboutStoryStats}>
                            <div className={styles.aboutStat}>
                                <span className={styles.aboutStatNumber}>500+</span>
                                <span className={styles.aboutStatLabel}>Happy Customers</span>
                            </div>
                            <div className={styles.aboutStat}>
                                <span className={styles.aboutStatNumber}>1000+</span>
                                <span className={styles.aboutStatLabel}>Products Sold</span>
                            </div>
                            <div className={styles.aboutStat}>
                                <span className={styles.aboutStatNumber}>5+</span>
                                <span className={styles.aboutStatLabel}>Years Experience</span>
                            </div>
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

                {/* Team Section */}
                <div className={styles.aboutSection}>
                    <div className={styles.aboutSectionHeader}>
                        <h2 className={styles.aboutSectionTitle}>Our Team</h2>
                        <div className={styles.aboutTitleUnderline}></div>
                    </div>
                    <div className={styles.aboutTeamGrid}>
                        <div className={styles.aboutTeamMember}>
                            <div className={styles.aboutMemberAvatar}>
                                <span className={styles.aboutAvatarInitial}>J</span>
                            </div>
                            <h3 className={styles.aboutMemberName}>John Smith</h3>
                            <p className={styles.aboutMemberRole}>Founder & CEO</p>
                            <p className={styles.aboutMemberBio}>
                                Passionate about business growth and customer satisfaction.
                            </p>
                        </div>
                        <div className={styles.aboutTeamMember}>
                            <div className={styles.aboutMemberAvatar}>
                                <span className={styles.aboutAvatarInitial}>S</span>
                            </div>
                            <h3 className={styles.aboutMemberName}>Sarah Johnson</h3>
                            <p className={styles.aboutMemberRole}>Operations Manager</p>
                            <p className={styles.aboutMemberBio}>
                                Ensuring smooth operations and quality control.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className={styles.aboutCtaSection}>
                    <h2 className={styles.aboutCtaTitle}>Ready to Get Started?</h2>
                    <p className={styles.aboutCtaText}>
                        Join thousands of satisfied customers who trust us for their needs.
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
