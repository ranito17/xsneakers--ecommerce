import React, { useState } from 'react';
import { useToast } from '../../components/common/toast';
import { getStockForSize } from '../../utils/product.utils';
import { formatPrice } from '../../utils/price.utils';
import { getProductImage } from '../../utils/image.utils';
import { ImageModal } from '../contactForm';
import styles from './cartItem.module.css';

const CartItem = ({ item, updateQuantity, removeFromCart, isLoading, currency = 'ILS', onImageClick }) => {
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const { showInfo } = useToast();
    
    // Default image URL for when product photo fails to load
    const defaultImageUrl = 'https://images.laced.com/slider_images/59f5a3a6-df0d-4c84-b774-8f641b34ea6f?auto=format&fit=max&w=600&q=100';
    
    const productImageUrl = getProductImage(item, defaultImageUrl);

    // Get available stock for the selected size using utility function
    // If item has sizes array, use that; otherwise fallback to stock_quantity
    const availableStock = item.sizes 
        ? getStockForSize(item.sizes, item.selected_size, item.stock_quantity || 99)
        : (item.stock_quantity || 99);

    const handleQuantityChange = (newQuantity) => {
        // Validate against available stock
        if (newQuantity > availableStock) {
            showInfo(`Only ${availableStock} items available for this size`);
            return;
        }
        
        updateQuantity(item.cartItemId, newQuantity);
    };

    const handleRemove = () => {
        removeFromCart(item.cartItemId);
    };

    const handleImageClick = () => {
        if (onImageClick) {
            onImageClick(item.img_url || defaultImageUrl, item.name);
        } else {
            setImageModalOpen(true);
        }
    };

    const itemTotal = item.price * item.quantity;

    // Format size display for customer view
    const formatSizeDisplay = (size) => {
        if (!size) return '';
        return size.toString();
    };

    // Format price with currency using utility
    const formatPriceWithCurrency = (price) => {
        return formatPrice(price, currency);
    };

    return (
        <>
            <div className={styles.cartItem}>
                {/* Remove Button - Positioned at top right */}
                <button
                    className={styles.removeButton}
                    onClick={handleRemove}
                    disabled={isLoading}
                    aria-label={`Remove ${item.name} from cart`}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>

                {/* Product Image - Clickable */}
                <div className={styles.itemImageContainer} onClick={handleImageClick}>
                    <img
                        src={productImageUrl}
                        alt={item.name}
                        className={styles.itemImage}
                        onError={(e) => {
                            e.target.src = defaultImageUrl;
                        }}
                    />
                    <div className={styles.imageOverlay}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className={styles.itemContent}>
                    {/* Product Details */}
                    <div className={styles.itemDetails}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        {item.description && (
                            <p className={styles.itemDescription}>{item.description}</p>
                        )}
                        <div className={styles.itemPrice}>Price: {formatPriceWithCurrency(item.price)}</div>
             
                        
                    </div>

                    {/* Actions Section */}
                    <div className={styles.itemActions}>
                        {/* Item Total - At the top */}
                        <div className={styles.itemTotal}>
                            <span className={styles.totalAmount}>Total Price: {formatPriceWithCurrency(itemTotal)}</span>
                        </div>

                        {/* Size Row */}
                        {item.selected_size && (
                            <div className={styles.sizeRow}>
                                <span className={styles.sizeLabel}>Selected Size: {formatSizeDisplay(item.selected_size)}</span>
                            </div>
                        )}

                        {/* Quantity Controls Row */}
                        <div className={styles.quantityRow}>
                            <span className={styles.quantityLabel}>Quantity:</span>
                            <div className={styles.quantityControls}>
                                <button
                                    className={styles.quantityBtn}
                                    onClick={() => handleQuantityChange(item.quantity - 1)}
                                    disabled={item.quantity <= 1 || isLoading}
                                    aria-label="Decrease quantity"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                </button>
                                
                                <span className={styles.quantity}>{item.quantity}</span>
                                
                                <button
                                    className={styles.quantityBtn}
                                    onClick={() => handleQuantityChange(item.quantity + 1)}
                                    disabled={isLoading}
                                    aria-label="Increase quantity"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            <ImageModal
                open={imageModalOpen}
                images={[productImageUrl]}
                alt={item.name}
                onClose={() => setImageModalOpen(false)}
            />
        </>
    );
};

export default CartItem;
