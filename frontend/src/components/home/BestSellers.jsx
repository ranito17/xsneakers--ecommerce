import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../products';
import { ErrorContainer, LoadingContainer } from '../contactForm';
import styles from './homeComponents.module.css';

const BestSellers = ({ 
    products, 
    loading, 
    error, 
    onRetry, 
    onImageClick,
    wishlistIds = [],
    onAddToWishlist,
    onRemoveFromWishlist,
    isAuthenticated,
    user
}) => {
    const navigate = useNavigate();

    if (error) {
        return (
            <div className={styles.productSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Best Sellers</h2>
                </div>
                <ErrorContainer 
                    message={error} 
                    onRetry={onRetry}
                    showRetry={true}
                />
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.productSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Best Sellers</h2>
                </div>
                <LoadingContainer message="Loading best sellers..." size="medium" />
            </div>
        );
    }

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className={styles.productSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Best Sellers</h2>
                <button 
                    className={styles.viewAllButton}
                    onClick={() => navigate('/products?sort=best-sellers')}
                >
                    View All
                </button>
            </div>
            <div className={styles.productGrid}>
                {products.map((product) => (
                    <ProductCard 
                        key={product.product_id} 
                        product={product}
                        onImageClick={onImageClick}
                        isInWishlist={wishlistIds.includes(Number(product.product_id || product.id))}
                        onAddToWishlist={onAddToWishlist}
                        onRemoveFromWishlist={onRemoveFromWishlist}
                        isAuthenticated={isAuthenticated}
                        user={user}
                    />
                ))}
            </div>
        </div>
    );
};

export default BestSellers;
