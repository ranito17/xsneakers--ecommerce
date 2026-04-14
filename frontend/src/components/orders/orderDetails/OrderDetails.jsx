import React, { useState } from 'react';
import { useSettings } from '../../../context/SettingsProvider';

import { formatPrice } from '../../../utils/price.utils';
import { getProductImage } from '../../../utils/image.utils';
import { formatDate } from '../../../utils/date.utils';
import { formatAddress } from '../../../utils/user.utils';
import ContactFormModal from '../../contactForm/ContactFormModal';
import styles from './orderDetails.module.css';

const OrderDetails = ({ order, orderItems, user, onClose, isOpen, onContactSubmit }) => {
    const { settings } = useSettings();
    const currency = settings?.currency || 'ILS';
    const [contactModalOpen, setContactModalOpen] = useState(false);
    // Don't render if modal is not open
    if (!isOpen) return null;

    // Using formatProductPrice from product.utils.js
    // Using getProductImage from image.utils.js

    // Format size display for customer view (selected size from order)
    const formatSizeDisplay = (selectedSize) => {
        if (!selectedSize) return '';
        return selectedSize.toString();
    };

    // Check if this is admin view (no user context)
    const isAdminView = !user;

    const handleContactSubmit = async (formData) => {
        if (onContactSubmit) {
            await onContactSubmit(formData, order?.order_id);
            setContactModalOpen(false);
        }
    };

    return (
        <>
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Order Details</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {!order ? (
                        <p>No order data available.</p>
                    ) : (
                        <div className={styles.orderDetails}>
                            <h3>Order #{order?.order_number || order?.order_id || 'N/A'}</h3>
                            
                            {/* Customer Information Section */}
                            <div className={styles.customerInfo}>
                                <h3>Customer Information</h3>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>Name:</span>
                                        <span className={styles.value}>{order?.customer_name || user?.full_name || 'N/A'}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>Email:</span>
                                        <span className={styles.value}>{order?.customer_email || user?.email || 'N/A'}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>Address:</span>
                                        <span className={styles.value}>{
                                            formatAddress(
                                                order?.shipping_address || 
                                                (orderItems && orderItems.length > 0 ? orderItems[0]?.shipping_address : null) ||
                                                null
                                            )
                                        }</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Information Section */}
                            <div className={styles.orderInfo}>
                                <h3>Order Information</h3>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>Order Number:</span>
                                        <span className={styles.value}>{order?.order_number || `#${order?.order_id}` || 'N/A'}</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>Order Date:</span>
                                        <span className={styles.value}>
                                            {formatDate(order?.created_at, 'long')}
                                        </span>
                                    </div>
                                    {order?.arrival_date_estimated && (
                                        <div className={styles.infoItem}>
                                            <span className={styles.label}>Estimated Delivery:</span>
                                            <span className={styles.value}>
                                                {formatDate(order.arrival_date_estimated, 'long')}
                                            </span>
                                        </div>
                                    )}
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>Payment Status:</span>
                                        <span className={styles.value}>
                                            {order?.payment_status || 'N/A'}
                                        </span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.label}>Total Amount:</span>
                                        <span className={`${styles.value} ${styles.totalAmount}`}>
                                            {order?.total_amount ? formatPrice(order.total_amount, currency) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Section */}
                            <div className={styles.orderItems}>
                                <h3>Order Items</h3>
                                {orderItems && orderItems.length > 0 ? (
                                    <div className={styles.itemsList}>
                                        {orderItems.map((item, index) => (
                                            <div key={`${item?.product_id || index}-${index}`} className={styles.itemCard}>
                                                {/* Product Image */}
                                                {(() => {
                                                    const imageUrl = getProductImage(
                                                        {
                                                            image_urls: item?.product_images || item?.image_urls,
                                                            images: item?.images,
                                                            img_url: item?.img_url
                                                        },
                                                        null
                                                    );
                                                    return imageUrl ? (
                                                        <div className={styles.itemImage}>
                                                            <img 
                                                                src={imageUrl} 
                                                                alt={item?.product_name || 'Product'}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    ) : null;
                                                })()}
                                                
                                                {/* Item Content */}
                                                <div className={styles.itemContent}>
                                                    {/* Product Name and Quantity Row */}
                                                    <div className={styles.productHeader}>
                                                        <h4 className={styles.productName}>{item?.product_name || 'Unknown Product'}</h4>
                                                        {item?.quantity && (
                                                            <span className={styles.quantity}>Qty: {item.quantity}</span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Price */}
                                                    <div className={styles.productPriceRow}>
                                                        <span className={styles.productPrice}>
                                                            {item?.product_price ? formatPrice(item.product_price, currency) : 'N/A'}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Size */}
                                                    {item?.selected_size && (
                                                        <div className={styles.productSize}>
                                                            <span className={styles.sizeLabel}>SIZE:</span>
                                                            <span className={styles.sizeValue}>{item.selected_size}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Item Total */}
                                                    <div className={styles.itemTotal}>
                                                        <span className={styles.itemTotalLabel}>Item Total:</span>
                                                        <span className={styles.itemTotalValue}>
                                                            {item?.product_price && item?.quantity ? 
                                                                formatPrice(item.product_price * item.quantity, currency) : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={styles.noItems}>No items found for this order.</p>
                                )}
                            </div>

                            {/* Report Issue Button - Only for customers */}
                            {!isAdminView && (
                                <div className={styles.reportIssueSection}>
                                    <button 
                                        className={styles.reportIssueButton}
                                        onClick={() => setContactModalOpen(true)}
                                    >
                                        🚨 Report Issue with this Order
                                    </button>
                                    <p className={styles.reportIssueText}>
                                        Having a problem with your order? Let us know and we'll help you right away.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Contact Form Modal for reporting issues */}
        <ContactFormModal
            isOpen={contactModalOpen}
            onClose={() => setContactModalOpen(false)}
            onSubmit={handleContactSubmit}
            type="customer_urgent"
            initialData={{
                orderId: order?.order_id,
                orderNumber: order?.order_number,
                subject: `URGENT: Issue with Order ${order?.order_number || order?.order_id}`
            }}
        />
        </>
    );
};

export default OrderDetails;
