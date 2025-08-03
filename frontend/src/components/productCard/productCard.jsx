// frontend/src/components/Product/Product.jsx
import React, { useState } from 'react';
import { useCart } from '../../context/useCart';
import styles from './productCard.module.css';

const ProductCard = ({ product, onImageClick }) => {
    const [isSaved, setIsSaved] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const { addToCart, isInCart, isLoading: cartLoading } = useCart();
   
    // Destructure product for better readability
    const {
        id,
        name,
        price,
        description,
        color,
        sizes,
        image_urls, // comma-separated string of URLs
        category_id,
        stock_quantity
    } = product;
    
    // Default image URL for when product photo fails to load
    const defaultImageUrl = 'https://images.laced.com/slider_images/59f5a3a6-df0d-4c84-b774-8f641b34ea6f?auto=format&fit=max&w=600&q=100';
    
    // Parse sizes from JSON if it's a string
    const availableSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes || [];
    
    // Parse colors from color field (separated by "/")
    const availableColors = color && typeof color === 'string' 
        ? color.split('/').map(c => c.trim()).filter(Boolean)
        : [];
    
    // Parse images from image_urls (comma-separated)
    let images = [];
    if (image_urls && typeof image_urls === 'string') {
        console.log('image_urls:', image_urls);
        images = image_urls.split(',').map(url => url.trim()).filter(Boolean);
    }
    if (!images.length) {
        images = [defaultImageUrl];
    }

    const handleImageClick = (idx = 0) => {
        if (onImageClick) {
            onImageClick(images, name, idx);
        }
    };

    const handleAddToCart = async () => {
        if (stock_quantity === 0) {
            return;
        }

        // Check if size is selected when sizes are available
        if (availableSizes.length > 0 && !selectedSize) {
            alert('Please select a size before adding to cart');
            return;
        }

        // Check if color is selected when colors are available
        if (availableColors.length > 0 && !selectedColor) {
            alert('Please select a color before adding to cart');
            return;
        }

        setIsAddingToCart(true);
        
        try {
            // Add product with selected size and color
            const productWithOptions = {
                ...product,
                selected_size: selectedSize,
                selected_color: selectedColor
            };
            await addToCart(productWithOptions, 1);
            // Success feedback could be added here (toast notification, etc.)
        } catch (error) {
            console.error('Error adding to cart:', error);
            // Error feedback could be added here
        } finally {
            setIsAddingToCart(false);
        }
    };
    
    const handleSave = () => {
        setIsSaved(!isSaved);
        // TODO: Implement save functionality
        console.log('Save product:', name);
    };

    // Check if we should disable the add to cart button
    const isDisabled = stock_quantity === 0 || cartLoading || isAddingToCart || 
        (availableSizes.length > 0 && !selectedSize) || 
        (availableColors.length > 0 && !selectedColor);
    
    return (
        <div className={styles.productCard}>
            {/* Product Image Section */}
            <div className={styles.imageContainer}>
                <img    
                    src={images[0]} 
                    alt={name} 
                    className={styles.productImage}
                    onClick={() => handleImageClick(0)}
                    onError={(e) => {
                        e.target.src = defaultImageUrl;
                    }}
                />
                <div className={styles.priceTag}>
                    ${price}
                </div>
                
                {/* Stock Status Badge */}
                {stock_quantity > 0 ? (
                    <div className={styles.stockBadge}>
                        <span className={styles.inStock}>In Stock</span>
                    </div>
                ) : (
                    <div className={styles.stockBadge}>
                        <span className={styles.outOfStock}>Out of Stock</span>
                    </div>
                )}
                {/* If multiple images, show thumbnails */}
                {images.length > 1 && (
                    <div className={styles.thumbnailPreview}>
                        {images.slice(0, 3).map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={name + ' preview ' + (idx + 1)}
                                className={styles.thumbnail}
                                onClick={e => { e.stopPropagation(); handleImageClick(idx); }}
                                onError={e => { e.target.src = defaultImageUrl; }}
                            />
                        ))}
                        {images.length > 3 && (
                            <span className={styles.moreImages}>+{images.length - 3}</span>
                        )}
                    </div>
                )}
            </div>
            
            {/* Product Information Section */}
            <div className={styles.productInfo}>
                <h3 className={styles.productName}>{name}</h3>
                
                {/* Price Display */}
                <div className={styles.priceDisplay}>
                    <span className={styles.price}>${price}</span>
                </div>
                
                {/* Color Selection */}
                {availableColors.length > 0 && (
                    <div className={styles.colorSection}>
                        <span className={styles.colorLabel}>Select Color:</span>
                        <select 
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className={styles.colorSelect}
                            required
                        >
                            <option value="">Choose a color</option>
                            {availableColors.map((colorOption, index) => (
                                <option key={index} value={colorOption}>
                                    {colorOption}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                {/* Size Selection */}
                {availableSizes.length > 0 && (
                    <div className={styles.sizesSection}>
                        <span className={styles.sizesLabel}>Select Size:</span>
                        <select 
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className={styles.sizeSelect}
                            required
                        >
                            <option value="">Choose a size</option>
                            {availableSizes.map((size, index) => (
                                <option key={index} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                {/* Description */}
                {description && (
                    <p className={styles.productDescription}>
                        {description.length > 80 
                            ? `${description.substring(0, 80)}...` 
                            : description
                        }
                    </p>
                )}
                
                {/* Stock Quantity */}
                {stock_quantity !== undefined && (
                    <div className={styles.stockInfo}>
                        <span className={styles.stockLabel}>Available:</span>
                        <span className={styles.stockQuantity}>{stock_quantity} units</span>
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className={styles.productActions}>
                    <button 
                        className={`${styles.addToCartButton} ${isInCart(id) ? styles.inCart : ''} ${isAddingToCart ? styles.loading : ''}`}
                        onClick={handleAddToCart}
                        disabled={isDisabled}
                        aria-label={`${isInCart(id) ? 'Already in cart' : 'Add'} ${name} to cart`}
                    >
                        {isAddingToCart ? (
                            <>
                                <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" strokeDasharray="31.416" strokeDashoffset="31.416">
                                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                                    </circle>
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
                        {isInCart(id) ? 'In Cart' : 'Add to Cart'}
                            </>
                        )}
                    </button>
                    
                    <button 
                        className={`${styles.saveButton} ${isSaved ? styles.saved : ''}`}
                        onClick={handleSave}
                        aria-label={`${isSaved ? 'Remove from saved' : 'Save'} ${name}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                        </svg>
                        {isSaved ? 'Saved' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;