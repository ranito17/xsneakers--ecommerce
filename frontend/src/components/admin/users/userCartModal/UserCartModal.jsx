import React from 'react';
import styles from './userCartModal.module.css';
import { getAbsoluteImageUrl, parseImageUrls } from '../../../../utils/image.utils';

const UserCartModal = ({ isOpen, onClose, cart, userName, loading = false }) => {
    if (!isOpen) return null;

    const formatPrice = (price) => {
        return `₪${parseFloat(price).toFixed(2)}`;
    };

    const getImageUrl = (images) => {
        const first = parseImageUrls(images)?.[0];
        return first ? getAbsoluteImageUrl(first) : '/placeholder.png';
    };

    const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const totalCost = cart?.totalCost || 0;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2>🛒 {userName}'s Cart</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Cart Content */}
                <div className={styles.modalBody}>
                    {loading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.loadingSpinner}></div>
                            <p>Loading cart...</p>
                        </div>
                    ) : !cart || cart.items?.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <div className={styles.emptyIcon}>🛒</div>
                            <h3>Cart is Empty</h3>
                            <p>This user has no items in their cart.</p>
                        </div>
                    ) : (
                        <>
                            {/* Cart Summary */}
                            <div className={styles.cartSummary}>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Total Items:</span>
                                    <span className={styles.summaryValue}>{totalItems}</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Total Cost:</span>
                                    <span className={styles.summaryValue}>{formatPrice(totalCost)}</span>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className={styles.cartItems}>
                                {cart.items.map((item) => (
                                    <div key={item.cartItemId} className={styles.cartItem}>
                                        {/* Product Image */}
                                        <div className={styles.itemImage}>
                                            <img 
                                                src={getImageUrl(item.images)} 
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.target.src = '/placeholder.png';
                                                }}
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className={styles.itemInfo}>
                                            <h4 className={styles.itemName}>{item.name}</h4>
                                            {item.selected_size && (
                                                <p className={styles.itemSize}>Size: {item.selected_size}</p>
                                            )}
                                            <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                                        </div>

                                        {/* Quantity */}
                                        <div className={styles.itemQuantity}>
                                            <span className={styles.quantityLabel}>Qty:</span>
                                            <span className={styles.quantityValue}>{item.quantity}</span>
                                        </div>

                                        {/* Total */}
                                        <div className={styles.itemTotal}>
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.modalFooter}>
                    <button className={styles.closeFooterButton} onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserCartModal;

