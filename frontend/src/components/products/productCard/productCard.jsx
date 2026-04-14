/**
 * קומפוננטת כרטיס מוצר - ProductCard
 * 
 * מציגה מוצר בודד עם אפשרויות להוספה לעגלה ו-wishlist
 * 
 * @param {Object} product - אובייקט המוצר להצגה
 * @param {Function} onImageClick - פונקציה לקריאה בעת לחיצה על תמונה
 * @param {boolean} isInWishlist - האם המוצר נמצא ב-wishlist
 * @param {Function} onAddToWishlist - פונקציה להוספת מוצר ל-wishlist (מהדף העליון)
 * @param {Function} onRemoveFromWishlist - פונקציה להסרת מוצר מ-wishlist (מהדף העליון)
 * @param {boolean} isAuthenticated - האם המשתמש מאומת
 * @param {Object} user - אובייקט המשתמש
 */
import React, { useState, useEffect } from 'react';
import { useCart } from '../../../hooks/useCart';
import { useSettings } from '../../../context/SettingsProvider';
import { useToast } from '../../../components/common/toast';
import { getAvailableSizesWithStock, getStockForSize } from '../../../utils/product.utils';
import { formatPrice } from '../../../utils/price.utils';
import { getProductImage, getProductImages } from '../../../utils/image.utils';
import styles from './productCard.module.css';

const ProductCard = ({ 
    product, 
    onImageClick,
    isInWishlist = false,
    onAddToWishlist,
    onRemoveFromWishlist,
    isAuthenticated,
    user
}) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [availableStock, setAvailableStock] = useState(0);
    const { addToCart, isInCart } = useCart();
    const { settings } = useSettings();
    const { showError, showWarning, showInfo } = useToast();
    
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
        sizes_display = '' // New field for customer display
    } = product;

    // Normalize images to absolute URLs for consistent rendering and modal behavior
    const normalizedImages = getProductImages(product);
    const thumbnailUrl = getProductImage(product, fallbackImage);

    // Get available sizes (only sizes with stock > 0)
    const availableSizes = getAvailableSizesWithStock(sizes);

    // Update available stock when size changes
    useEffect(() => {
        const stock = getStockForSize(sizes, selectedSize, stock_quantity);
        setAvailableStock(stock);
        // Reset quantity to 1 or max available stock when size changes
        setQuantity(Math.min(1, stock));
    }, [selectedSize, sizes, stock_quantity]);

    // אין צורך בטעינת wishlist - מקבל את הסטטוס כ-prop מהדף העליון

    /**
     * מוסיף מוצר לעגלה
     * בודק תקינות: בחירת גדל, מלאי זמין, כמות
     * @returns {void}
     */
    const handleAddToCart = async () => {
        // בדיקה אם נדרש גדל ולא נבחר
        if (availableSizes.length > 0 && !selectedSize) {
            showWarning('Please select a size before adding to cart');
            return;
        }

        // בדיקה אם יש מלאי זמין
        if (availableStock === 0) {
            showInfo('הגדל הזה לא במלאי');
            return;
        }

        // בדיקה שהכמות לא עולה על המלאי הזמין
        if (quantity > availableStock) {
            showInfo(`Only ${availableStock} items available for this size`);
            return;
        }

        setIsAddingToCart(true);
        
        try {
            // הוספת מוצר עם גדל וכמות נבחרים
            const productWithOptions = {
                ...product,
                selected_size: selectedSize,
                available_stock: availableStock
            };
            const result = await addToCart(productWithOptions, quantity);
            
            // בדיקה אם ההוספה נחסמה (למשל אדמין צופה בחנות)
            if (result && result.success === false) {
                showError(result.message || 'Cannot add item to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showError('Failed to add item to cart. Please try again.');
        } finally {
            setIsAddingToCart(false);
        }
    };

    /**
     * מוסיף/מסיר מוצר מה-wishlist
     * קורא לפונקציות מהדף העליון
     * @returns {void}
     */
    const handleSaveToggle = async () => {
        // בדיקה אם המשתמש מאומת
        if (!isAuthenticated) {
            showInfo('Please login to add items to your wishlist');
            return;
        }

        // בדיקה אם המשתמש הוא אדמין
        if (user?.role === 'admin') {
            showInfo('Admins cannot add items to wishlist');
            return;
        }

        try {
            if (isInWishlist) {
                // הסרה מה-wishlist - קריאה לפונקציה מהדף העליון
                if (onRemoveFromWishlist) {
                    await onRemoveFromWishlist(id);
                }
            } else {
                // הוספה ל-wishlist - קריאה לפונקציה מהדף העליון
                if (onAddToWishlist) {
                    await onAddToWishlist(id);
                }
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
            showError('Failed to update wishlist. Please try again.');
        }
    };

    const handleImageClick = () => {
        if (onImageClick && normalizedImages.length > 0) {
            onImageClick(normalizedImages, name);
        }
    };

    // Check if item is in cart with current size selection
    const itemInCart = isInCart(id, selectedSize);

    return (
        <div className={styles.productCard}>
            {/* Image Section */}
            <div className={styles.imageSection}>
                <img
                    src={thumbnailUrl}
                    alt={name}
                    className={styles.productImage}
                    onClick={handleImageClick}
                    onError={(e) => {
                        // Keep fallback same-origin so it works in prod too
                        e.target.src = fallbackImage;
                    }}
                />
                
                {/* Save Button */}
                <button
                    className={`${styles.saveButton} ${isInWishlist ? styles.saved : ''}`}
                    onClick={handleSaveToggle}
                    aria-label={isInWishlist ? 'Remove from saved' : 'Save item'}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>

            {/* Product Info Section */}
            <div className={styles.productInfo}>
                <h3 className={styles.productName}>{name}</h3>
                
                <div className={styles.priceSection}>
                    <span className={styles.price}>{formatPrice(price, settings?.currency || 'ILS')}</span>
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
                            {availableSizes.map((size, index) => {
                                // Handle both old format (string) and new format (object)
                                const sizeValue = typeof size === 'object' ? size.size : size;
                                return (
                                    <option key={index} value={sizeValue}>
                                        {sizeValue}
                                    </option>
                                );
                            })}
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
                            disabled={quantity <= 1 || !selectedSize || availableStock === 0}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                        <span className={styles.quantityDisplay}>{quantity}</span>
                        <button 
                            className={styles.quantityButton}
                            onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                            disabled={!selectedSize || quantity >= availableStock || availableStock === 0}
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
                    disabled={availableStock === 0 || isAddingToCart || (availableSizes.length > 0 && !selectedSize)}
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