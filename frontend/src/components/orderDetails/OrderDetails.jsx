import React from 'react';
import styles from './orderDetails.module.css';

const OrderDetails = ({ order, orderItems, user, onImageClick }) => {
    // Helper functions
    console.log('OrderDetails component rendered with:', { order, orderItems, user });
    const formatPrice = (price) => {
        return `$${parseFloat(price).toFixed(2)}`;
    };

    const getProductImage = (imageUrls) => {
        if (!imageUrls) return '/placeholder-image.jpg';
        const images = imageUrls.split(',').map(url => url.trim()).filter(Boolean);
        return images[0] || '/placeholder-image.jpg';
    };

    const handleImageClick = (imageUrls, productName) => {
        console.log('handleImageClick called with:', { imageUrls, productName });
        if (onImageClick) {
            onImageClick(imageUrls, productName);
        }
    };

    return (
        <div className={styles.orderDetails}>
            <h2>Order Details for {order.order_number || `Order #${order.order_id}`}</h2>
            
            {/* Customer Information Section */}
            <div className={styles.customerInfo}>
                <h3>Customer Information</h3>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Name:</span>
                        <span className={styles.value}>{user?.full_name || 'N/A'}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Email:</span>
                        <span className={styles.value}>{user?.email || 'N/A'}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Address:</span>
                        <span className={styles.value}>{user?.address || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Order Information Section */}
            <div className={styles.orderInfo}>
                <h3>Order Information</h3>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Order Number:</span>
                        <span className={styles.value}>{order.order_number || `#${order.order_id}`}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Order Date:</span>
                        <span className={styles.value}>
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Shipping Status:</span>
                        <span className={`${styles.value} ${styles.status} ${styles[order.status]}`}>
                            {order.status}
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Estimated Delivery:</span>
                        <span className={styles.value}>
                            {new Date(order.arrival_date_estimated).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Payment Status:</span>
                        <span className={`${styles.value} ${styles.status} ${styles[order.payment_status]}`}>
                            {order.payment_status}
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>Total Amount:</span>
                        <span className={`${styles.value} ${styles.totalAmount}`}>
                            ${parseFloat(order.total_amount).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Order Items Section */}
            <div className={styles.orderItems}>
                <h3>Order Items</h3>
                {orderItems.length > 0 ? (
                    <div className={styles.itemsList}>
                        {orderItems.map((item, index) => (
                            <div key={`${item.product_id}-${index}`} className={styles.itemCard}>
                                {/* Product Name */}
                                <h4 className={styles.productName}>{item.product_name}</h4>
                                
                                {/* Product Image */}
                                {getProductImage(item.product_images) && (
                                    <div 
                                        className={styles.itemImage}
                                        onClick={() => handleImageClick(item.product_images, item.product_name)}
                                    >
                                        <img 
                                            src={getProductImage(item.product_images)} 
                                            alt={item.product_name}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                                
                                {/* Product Info */}
                                <div className={styles.productInfo}>
                                    <span className={styles.productPrice}>${formatPrice(item.product_price)}</span>
                                    {item.quantity && (
                                        <span className={styles.quantity}>Qty: {item.quantity}</span>
                                    )}
                                </div>
                                
                                {/* Product Options */}
                                <div className={styles.productOptions}>
                                    {item.selected_color && (
                                        <div className={styles.option}>
                                            <span className={styles.optionLabel}>Color:</span>
                                            <span className={styles.optionValue}>{item.selected_color}</span>
                                        </div>
                                    )}
                                    {item.selected_size && (
                                        <div className={styles.option}>
                                            <span className={styles.optionLabel}>Size:</span>
                                            <span className={styles.optionValue}>{item.selected_size}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Item Total */}
                                <div className={styles.itemTotal}>
                                    <span className={styles.itemTotalLabel}>Item Total:</span>
                                    <span className={styles.itemTotalValue}>
                                        ${formatPrice(item.product_price * (item.quantity || 1))}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.noItems}>No items found for this order.</p>
                )}
            </div>
        </div>
    );
};

export default OrderDetails;
