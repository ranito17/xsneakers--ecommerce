import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import styles from './productCard.module.css';

const ProductCard = ({ product, onImageClick }) => {
    const [isSaved, setIsSaved] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const { addToCart, isInCart } = useCart();
    
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
        sizes = []
    } = product;

    // Parse sizes from JSON if it's a string
    const availableSizes = typeof sizes === 'string' ? JSON.parse(sizes || '[]') : sizes || [];

    const handleAddToCart = async () => {
        if (stock_quantity === 0) {
            return;
        }

        // Check if size is selected when sizes are available
        if (availableSizes.length > 0 && !selectedSize) {
            alert('Please select a size before adding to cart');
            return;
        }

        setIsAddingToCart(true);
        
        try {
            // Add product with selected size and quantity
            const productWithOptions = {
                ...product,
                selected_size: selectedSize
            };
            await addToCart(productWithOptions, quantity);
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleSaveToggle = () => {
        setIsSaved(!isSaved);
    };

    const handleImageClick = () => {
        // Use images array if available, otherwise fallback to img_url
        const imageArray = images || (img_url ? [img_url] : []);
        if (onImageClick && imageArray.length > 0) {
            onImageClick(imageArray, name);
        }
    };

    // Check if item is in cart with current size selection
    const itemInCart = isInCart(id, selectedSize);

    return (
        <div className={styles.productCard}>
            {/* Image Section */}
            <div className={styles.imageSection}>
                <img
                    src={images && images.length > 0 ? images[0] : img_url}
                    alt={name}
                    className={styles.productImage}
                    onClick={handleImageClick}
                />
                
                {/* Stock Badge */}
                <div className={styles.stockBadge}>
                    {stock_quantity > 0 ? (
                        <span className={styles.inStock}>In Stock</span>
                    ) : (
                        <span className={styles.outOfStock}>Out of Stock</span>
                    )}
                </div>

                {/* Save Button */}
                <button
                    className={`${styles.saveButton} ${isSaved ? styles.saved : ''}`}
                    onClick={handleSaveToggle}
                    aria-label={isSaved ? 'Remove from saved' : 'Save item'}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>

            {/* Product Info Section */}
            <div className={styles.productInfo}>
                <h3 className={styles.productName}>{name}</h3>
                
                <div className={styles.priceSection}>
                    <span className={styles.price}>${price}</span>
                </div>
                
                {description && (
                    <p className={styles.productDescription}>{description}</p>
                )}
            </div>

            {/* Options Section */}
            <div className={styles.optionsSection}>
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
                
                {/* Quantity Selection */}
                <div className={styles.quantitySection}>
                    <label className={styles.quantityLabel}>Quantity:</label>
                    <div className={styles.quantityControls}>
                        <button 
                            className={styles.quantityButton}
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                        <span className={styles.quantityDisplay}>{quantity}</span>
                        <button 
                            className={styles.quantityButton}
                            onClick={() => setQuantity(Math.min(stock_quantity, quantity + 1))}
                            disabled={quantity >= stock_quantity}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Section */}
            <div className={styles.actionSection}>
                <button
                    className={`${styles.addToCartButton} ${itemInCart ? styles.inCart : ''} ${isAddingToCart ? styles.loading : ''}`}
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
                    ) : itemInCart ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4"/>
                                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                            </svg>
                            In Cart
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4"/>
                                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                            </svg>
                            Add to Cart
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;