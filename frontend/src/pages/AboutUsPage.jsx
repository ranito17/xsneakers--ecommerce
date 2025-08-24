import React from 'react';
import styles from './aboutUsPage.module.css';

const AboutUsPage = () => {
    return (
        <div className={styles.aboutUsPage}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>About Our Store</h1>
                    <p className={styles.heroSubtitle}>
                        Your trusted destination for premium sneakers and exceptional service
                    </p>
                </div>
                <div className={styles.heroOverlay}></div>
            </section>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Our Story Section */}
                <section className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Our Story</h2>
                            <div className={styles.titleUnderline}></div>
                        </div>
                        <div className={styles.storyContent}>
                            <div className={styles.storyText}>
                                <p>
                                    Founded with a passion for sneakers and a commitment to quality, our store 
                                    has been serving sneaker enthusiasts since our establishment. What started 
                                    as a small local shop has grown into a trusted destination for premium 
                                    footwear from the world's most iconic brands.
                                </p>
                                <p>
                                    We believe that every step matters, and that's why we carefully curate 
                                    our collection to include only the finest sneakers from Nike, Adidas, 
                                    Vans, New Balance, and Puma. Our team of sneaker experts is dedicated 
                                    to helping you find the perfect pair that matches your style and comfort needs.
                                </p>
                            </div>
                            <div className={styles.storyStats}>
                                <div className={styles.stat}>
                                    <span className={styles.statNumber}>5+</span>
                                    <span className={styles.statLabel}>Years of Experience</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statNumber}>1000+</span>
                                    <span className={styles.statLabel}>Happy Customers</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statNumber}>500+</span>
                                    <span className={styles.statLabel}>Sneaker Models</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission & Values Section */}
                <section className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Our Mission & Values</h2>
                            <div className={styles.titleUnderline}></div>
                        </div>
                        <div className={styles.missionContent}>
                            <div className={styles.missionCard}>
                                <div className={styles.missionIcon}>🎯</div>
                                <h3 className={styles.missionTitle}>Our Mission</h3>
                                <p className={styles.missionText}>
                                    To provide sneaker enthusiasts with access to premium quality footwear 
                                    while delivering exceptional customer service and creating a community 
                                    of passionate sneaker lovers.
                                </p>
                            </div>
                            <div className={styles.valuesGrid}>
                                <div className={styles.valueCard}>
                                    <div className={styles.valueIcon}>✨</div>
                                    <h4 className={styles.valueTitle}>Quality</h4>
                                    <p className={styles.valueText}>
                                        We only stock authentic, high-quality sneakers from trusted brands.
                                    </p>
                                </div>
                                <div className={styles.valueCard}>
                                    <div className={styles.valueIcon}>🤝</div>
                                    <h4 className={styles.valueTitle}>Service</h4>
                                    <p className={styles.valueText}>
                                        Exceptional customer service is at the heart of everything we do.
                                    </p>
                                </div>
                                <div className={styles.valueCard}>
                                    <div className={styles.valueIcon}>💎</div>
                                    <h4 className={styles.valueTitle}>Authenticity</h4>
                                    <p className={styles.valueText}>
                                        Every sneaker in our collection is 100% authentic and verified.
                                    </p>
                                </div>
                                <div className={styles.valueCard}>
                                    <div className={styles.valueIcon}>🚀</div>
                                    <h4 className={styles.valueTitle}>Innovation</h4>
                                    <p className={styles.valueText}>
                                        We stay ahead of trends to bring you the latest and greatest sneakers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Brands Section */}
                <section className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Our Premium Brands</h2>
                            <div className={styles.titleUnderline}></div>
                        </div>
                        <div className={styles.brandsGrid}>
                            <div className={styles.brandCard}>
                                <div className={styles.brandLogo}>Nike</div>
                                <p className={styles.brandDescription}>
                                    Just Do It. The world's leading athletic footwear and apparel brand.
                                </p>
                            </div>
                            <div className={styles.brandCard}>
                                <div className={styles.brandLogo}>Adidas</div>
                                <p className={styles.brandDescription}>
                                    Impossible is Nothing. Innovation and performance in every step.
                                </p>
                            </div>
                            <div className={styles.brandCard}>
                                <div className={styles.brandLogo}>Vans</div>
                                <p className={styles.brandDescription}>
                                    Off the Wall. Iconic skateboarding culture and lifestyle footwear.
                                </p>
                            </div>
                            <div className={styles.brandCard}>
                                <div className={styles.brandLogo}>New Balance</div>
                                <p className={styles.brandDescription}>
                                    Fearlessly Independent. Premium comfort and performance technology.
                                </p>
                            </div>
                            <div className={styles.brandCard}>
                                <div className={styles.brandLogo}>Puma</div>
                                <p className={styles.brandDescription}>
                                    Forever Faster. Bold design and athletic performance combined.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Meet Our Team</h2>
                            <div className={styles.titleUnderline}></div>
                        </div>
                        <div className={styles.teamGrid}>
                            <div className={styles.teamMember}>
                                <div className={styles.memberAvatar}>
                                    <span className={styles.avatarInitial}>R</span>
                                </div>
                                <h3 className={styles.memberName}>Rani Tobassy</h3>
                                <p className={styles.memberRole}>Founder & CEO</p>
                                <p className={styles.memberBio}>
                                    Passionate about sneakers and committed to building the best sneaker 
                                    shopping experience for our customers.
                                </p>
                            </div>
                            <div className={styles.teamMember}>
                                <div className={styles.memberAvatar}>
                                    <span className={styles.avatarInitial}>S</span>
                                </div>
                                <h3 className={styles.memberName}>Shady Ghadban</h3>
                                <p className={styles.memberRole}>Co-Founder & COO</p>
                                <p className={styles.memberBio}>
                                    Dedicated to operational excellence and ensuring every customer 
                                    receives exceptional service.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className={styles.ctaSection}>
                    <div className={styles.container}>
                        <div className={styles.ctaContent}>
                            <h2 className={styles.ctaTitle}>Ready to Find Your Perfect Sneakers?</h2>
                            <p className={styles.ctaText}>
                                Explore our collection of premium sneakers and experience the difference 
                                that quality and service make.
                            </p>
                            <div className={styles.ctaButtons}>
                                <a href="/products" className={styles.ctaButtonPrimary}>
                                    Shop Now
                                </a>
                                <a href="/contact" className={styles.ctaButtonSecondary}>
                                    Contact Us
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutUsPage;
