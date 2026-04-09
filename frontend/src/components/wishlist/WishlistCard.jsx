import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../context/SettingsProvider';
import { useToast } from '../../components/common/toast';
import { extractSizeNumbers } from '../../utils/product.utils';
import { formatPrice } from '../../utils/price.utils';
import { getProductImage } from '../../utils/image.utils';
import styles from './wishlistCard.module.css';

const WishlistCard = ({ product, onRemove }) => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [selectedSize, setSelectedSize] = useState('');
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const { addToCart } = useCart();
    const { showWarning, showSuccess } = useToast();
    const fallbackImage = '/logo192.png';
    
    // Destructure product for better readability
    const {
        id,
        name,
        price,
        description,
        img_url,
        image_urls,
        images,
        stock_quantity,
        sizes = [],
        sizes_display = ''
    } = product;

    // Get available sizes using helper function
    const getAvailableSizes = () => {
        if (sizes_display) {
            return sizes_display.split(',').map(size => size.trim()).filter(size => size);
        }
        return extractSizeNumbers(sizes).map(size => size.toString());
    };

    const availableSizes = getAvailableSizes();

    const handleAddToCart = async () => {
        if (stock_quantity === 0) {
            return;
        }

        // Check if size is selected when sizes are available
        if (availableSizes.length > 0 && !selectedSize) {
            showWarning('Please select a size before adding to cart');
            return;
        }

        setIsAddingToCart(true);
        
        try {
            const productWithOptions = {
                ...product,
                selected_size: selectedSize
            };
            await addToCart(productWithOptions, 1);
            showSuccess('Added to cart successfully!');
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        if (stock_quantity === 0) {
            return;
        }

        // Check if size is selected when sizes are available
        if (availableSizes.length > 0 && !selectedSize) {
            showWarning('Please select a size before proceeding');
            return;
        }

        // Navigate to payment page with product data (NOT adding to cart)
        const productWithOptions = {
            ...product,
            selected_size: selectedSize,
            quantity: 1
        };
        
        navigate('/payment', { 
            state: { 
                buyNowProduct: productWithOptions,
                fromWishlist: true
            } 
        });
    };

    const handleRemove = async () => {
        setIsRemoving(true);
        try {
            await onRemove(id);
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <div className={styles.wishlistCard}>
            {/* Image Section */}
            <div className={styles.imageSection}>
                <img
                    src={getProductImage(product, fallbackImage)}
                    alt={name}
                    className={styles.productImage}
                    onError={(e) => {
                        e.target.src = fallbackImage;
                    }}
                />
                
                {/* Stock Badge */}
                <div className={styles.stockBadge}>
                    {stock_quantity > 0 ? (
                        <span className={styles.inStock}>In Stock</span>
                    ) : (
                        <span className={styles.outOfStock}>Out of Stock</span>
                    )}
                </div>
            </div>

            {/* Product Details */}
            <div className={styles.detailsSection}>
                <h3 className={styles.productName}>{name}</h3>
                
                <div className={styles.priceSection}>
                    <span className={styles.price}>{formatPrice(price, settings?.currency || 'ILS')}</span>
                </div>
                
                {description && (
                    <p className={styles.productDescription}>{description}</p>
                )}

                {/* Size Selection */}
                {availableSizes.length > 0 && (
                    <div className={styles.sizeSection}>
                        <label className={styles.sizeLabel}>Size:</label>
                        <select
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className={styles.sizeSelect}
                        >
                            <option value="">Select Size</option>
                            {availableSizes.map((size, index) => (
                                <option key={index} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className={styles.actionSection}>
                <button
                    className={`${styles.actionButton} ${styles.addToCartButton}`}
                    onClick={handleAddToCart}
                    disabled={stock_quantity === 0 || isAddingToCart}
                >
                    {isAddingToCart ? (
                        <>
                            <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" strokeDasharray="31.416" strokeDashoffset="31.416"/>
                            </svg>
                            Adding...
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1"/>
                                <circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                            Add to Cart
                        </>
                    )}
                </button>

                <button
                    className={`${styles.actionButton} ${styles.buyNowButton}`}
                    onClick={handleBuyNow}
                    disabled={stock_quantity === 0 || isAddingToCart}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                    Buy Now
                </button>

                <button
                    className={`${styles.actionButton} ${styles.removeButton}`}
                    onClick={handleRemove}
                    disabled={isRemoving}
                >
                    {isRemoving ? (
                        <>
                            <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" strokeDasharray="31.416" strokeDashoffset="31.416"/>
                            </svg>
                            Removing...
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                            Remove
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default WishlistCard;

