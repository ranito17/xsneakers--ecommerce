import React from 'react';
import styles from './cartItem.module.css';

const CartItem = ({ item, updateQuantity, removeFromCart, isLoading }) => {
    // Default image URL for when product photo fails to load
    const defaultImageUrl = 'https://images.laced.com/slider_images/59f5a3a6-df0d-4c84-b774-8f641b34ea6f?auto=format&fit=max&w=600&q=100';

    const handleQuantityChange = (newQuantity) => {
        updateQuantity(item.id, newQuantity);
    };

    const handleRemove = () => {
        removeFromCart(item.id);
    };

    const itemTotal = item.price * item.quantity;

    return (
        <div className={styles.cartItem}>
            {/* Product Image */}
            <div className={styles.itemImageContainer}>
                <img
                    src={item.img_url || defaultImageUrl}
                    alt={item.name}
                    className={styles.itemImage}
                    onError={(e) => {
                        e.target.src = defaultImageUrl;
                    }}
                />
            </div>

            {/* Product Details */}
            <div className={styles.itemDetails}>
                <h3 className={styles.itemName}>{item.name}</h3>
                {item.description && (
                    <p className={styles.itemDescription}>{item.description}</p>
                )}
                {item.selected_color && (
                    <p className={styles.itemColor}>Color: {item.selected_color}</p>
                )}
                {item.selected_size && (
                    <p className={styles.itemSize}>Size: {item.selected_size}</p>
                )}
                <div className={styles.itemPrice}>${item.price}</div>
            </div>

            {/* Quantity Controls */}
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

            {/* Item Total */}
            <div className={styles.itemTotal}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalAmount}>${itemTotal.toFixed(2)}</span>
            </div>

            {/* Remove Button */}
            <button
                className={styles.removeButton}
                onClick={handleRemove}
                disabled={isLoading}
                aria-label={`Remove ${item.name} from cart`}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    );
};

export default CartItem;
