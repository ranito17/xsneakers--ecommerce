import React from 'react';
import styles from './dashboard.module.css';

const ProductDetailsModal = ({ product, onClose }) => {
    if (!product) return null;

    const formatPrice = (price) => {
        return `$${parseFloat(price)}`;
    };

    const getProductImage = (imageUrls) => {
        if (!imageUrls) return '/placeholder-image.jpg';
        const images = imageUrls.split(',').map(url => url.trim()).filter(Boolean);
        return images[0] || '/placeholder-image.jpg';
    };

    const formatSizes = (sizes) => {
        if (!sizes) return 'N/A';
        
        if (Array.isArray(sizes)) {
            return sizes.join(', ');
        }
        
        if (typeof sizes === 'string') {
            try {
                const cleanSizes = sizes.replace(/[\[\]"]/g, '').split(',');
                return cleanSizes.join(', ');
            } catch (error) {
                return sizes;
            }
        }
        
        return sizes;
    };

    return (
        <div className={styles.productModalOverlay} onClick={onClose}>
            <div className={styles.productModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.productModalHeader}>
                    <h2>Product Details - {product.name}</h2>
                    <button 
                        onClick={onClose}
                        className={styles.productModalClose}
                    >
                        ×
                    </button>
                </div>
                <div className={styles.productModalContent}>
                    {/* Product Image */}
                    <div className={styles.productModalImage}>
                        <img 
                            src={getProductImage(product.image_urls)} 
                            alt={product.name}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>

                    {/* Product Information */}
                    <div className={styles.productModalSection}>
                        <h3>Product Information</h3>
                        <div className={styles.productInfoGrid}>
                            <div className={styles.productInfoItem}>
                                <span className={styles.productInfoLabel}>Name:</span>
                                <span className={styles.productInfoValue}>{product.name}</span>
                            </div>
                            <div className={styles.productInfoItem}>
                                <span className={styles.productInfoLabel}>Price:</span>
                                <span className={styles.productInfoValue}>{formatPrice(product.price)}</span>
                            </div>
                            <div className={styles.productInfoItem}>
                                <span className={styles.productInfoLabel}>Stock Quantity:</span>
                                <span className={`${styles.productInfoValue} ${product.stock_quantity <= 5 ? styles.lowStock : ''}`}>
                                    {product.stock_quantity} units
                                </span>
                            </div>
                            <div className={styles.productInfoItem}>
                                <span className={styles.productInfoLabel}>Category:</span>
                                <span className={styles.productInfoValue}>{product.category_name || 'N/A'}</span>
                            </div>
                            {product.color && (
                                <div className={styles.productInfoItem}>
                                    <span className={styles.productInfoLabel}>Color:</span>
                                    <span className={styles.productInfoValue}>{product.color}</span>
                                </div>
                            )}
                            {product.sizes && (
                                <div className={styles.productInfoItem}>
                                    <span className={styles.productInfoLabel}>Sizes:</span>
                                    <span className={styles.productInfoValue}>{formatSizes(product.sizes)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Description */}
                    {product.description && (
                        <div className={styles.productModalSection}>
                            <h3>Description</h3>
                            <p className={styles.productDescription}>{product.description}</p>
                        </div>
                    )}

                    {/* Product Status */}
                    <div className={styles.productModalSection}>
                        <h3>Product Status</h3>
                        <div className={styles.productStatusInfo}>
                            <div className={styles.productInfoItem}>
                                <span className={styles.productInfoLabel}>Status:</span>
                                <span className={`${styles.productInfoValue} ${product.stock_quantity > 0 ? styles.inStock : styles.outOfStock}`}>
                                    {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                            <div className={styles.productInfoItem}>
                                <span className={styles.productInfoLabel}>Created:</span>
                                <span className={styles.productInfoValue}>
                                    {new Date(product.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })} at {new Date(product.created_at).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </span>
                            </div>
                            {product.updated_at && (
                                <div className={styles.productInfoItem}>
                                    <span className={styles.productInfoLabel}>Last Updated:</span>
                                    <span className={styles.productInfoValue}>
                                        {new Date(product.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })} at {new Date(product.updated_at).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsModal;
