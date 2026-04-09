import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './homeComponents.module.css';

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.heroSection}>
            <div className={styles.heroBackground}>
                <div className={styles.heroOverlay}></div>
            </div>
            <div className={styles.heroContent}>
                <div className={styles.heroText}>
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
                    </div>
                </div>
                <div className={styles.heroImage}>
                    <div className={styles.heroImageContainer}>
                        <img 
                            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                            alt="Premium Sneakers Collection"
                            className={styles.heroImg}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
