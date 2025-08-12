import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../services/productApi';
import ProductCard from '../components/productCard/productCard';
import styles from './pages.module.css';

function Home() {
    const navigate = useNavigate();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productApi.getProducts();
                if (response.success && response.data) {
                    const products = response.data;
                    
                    // Get first 8 products for featured
                    setFeaturedProducts(products.slice(0, 8));
                    
                    // Sort by creation date and get newest 3
                    const sortedByDate = products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                    setNewArrivals(sortedByDate.slice(0, 3));
                    
                    // Mock best sellers (you can implement actual logic based on sales)
                    setBestSellers(products.slice(3, 6));
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        // Add newsletter signup logic here
        alert('Thanks for signing up! You\'ll receive early access to exclusive drops.');
        setEmail('');
    };

    return (
        <div className={styles.homePage}>
            {/* Hero Section */}
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Step Into Style</h1>
                    <p className={styles.heroSubtitle}>
                        Discover the latest in premium sneakers and streetwear. 
                        Your ultimate destination for authentic kicks and urban fashion.
                    </p>
                    <div className={styles.heroButtons}>
                        <button 
                            className={styles.primaryButton}
                            onClick={() => navigate('/products')}
                        >
                            Shop Now
                        </button>
                        <button 
                            className={styles.secondaryButton}
                            onClick={() => navigate('/products')}
                        >
                            Explore Collection
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Navigation */}
            <div className={styles.quickNavSection}>
                <div className={styles.quickNavGrid}>
                    <div className={styles.quickNavCard} onClick={() => navigate('/products')}>
                        <div className={styles.quickNavIcon}>👨</div>
                        <h3>Men's</h3>
                    </div>
                    <div className={styles.quickNavCard} onClick={() => navigate('/products')}>
                        <div className={styles.quickNavIcon}>👩</div>
                        <h3>Women's</h3>
                    </div>
                    <div className={styles.quickNavCard} onClick={() => navigate('/products')}>
                        <div className={styles.quickNavIcon}>🧒</div>
                        <h3>Kids'</h3>
                    </div>
                    <div className={styles.quickNavCard} onClick={() => navigate('/products')}>
                        <div className={styles.quickNavIcon}>⭐</div>
                        <h3>Limited</h3>
                    </div>
                    <div className={styles.quickNavCard} onClick={() => navigate('/products')}>
                        <div className={styles.quickNavLogo}>NIKE</div>
                    </div>
                    <div className={styles.quickNavCard} onClick={() => navigate('/products')}>
                        <div className={styles.quickNavLogo}>JORDAN</div>
                    </div>
                </div>
            </div>

            {/* New Arrivals */}
            {!loading && newArrivals.length > 0 && (
                <div className={styles.productSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>New Arrivals</h2>
                        <button 
                            className={styles.viewAllButton}
                            onClick={() => navigate('/products')}
                        >
                            View All
                        </button>
                    </div>
                    <div className={styles.productGrid}>
                        {newArrivals.map((product) => (
                            <ProductCard 
                                key={product.product_id} 
                                product={product}
                                onImageClick={() => {}} 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Best Sellers */}
            {!loading && bestSellers.length > 0 && (
                <div className={styles.productSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Best Sellers</h2>
                        <button 
                            className={styles.viewAllButton}
                            onClick={() => navigate('/products')}
                        >
                            View All
                        </button>
                    </div>
                    <div className={styles.productGrid}>
                        {bestSellers.map((product) => (
                            <ProductCard 
                                key={product.product_id} 
                                product={product}
                                onImageClick={() => {}} 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Trust & Social Proof */}
            <div className={styles.trustSection}>
                <div className={styles.trustContent}>
                    <div className={styles.trustStats}>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>50K+</span>
                            <span className={styles.statLabel}>Customers</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>4.9★</span>
                            <span className={styles.statLabel}>Rating</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statNumber}>100%</span>
                            <span className={styles.statLabel}>Authentic</span>
                        </div>
                    </div>
                    <div className={styles.trustBenefits}>
                        <span className={styles.trustBenefit}>✓ Free Shipping</span>
                        <span className={styles.trustBenefit}>✓ Secure Payment</span>
                        <span className={styles.trustBenefit}>✓ Early Access</span>
                    </div>
                </div>
            </div>

            {/* Newsletter Signup */}
            <div className={styles.newsletterSection}>
                <div className={styles.newsletterContent}>
                    <h2 className={styles.newsletterTitle}>Get Early Access to Drops</h2>
                    <p className={styles.newsletterDescription}>
                        Be the first to know about new releases, exclusive sales, and limited drops.
                        Plus get 10% off your first purchase!
                    </p>
                    <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.newsletterInput}
                            required
                        />
                        <button type="submit" className={styles.newsletterButton}>
                            Subscribe
                        </button>
                    </form>
                    <p className={styles.newsletterDisclaimer}>
                        * No spam, unsubscribe anytime. Your email is safe with us.
                    </p>
                </div>
            </div>


        </div>
    );
}

export default Home;