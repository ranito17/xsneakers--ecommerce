import React from 'react';
import { useSettings } from '../../../../context/SettingsProvider';
import { formatCustomerEmail, getOrderImages } from '../../../../utils/order.utils';
import { parseImageUrls, getAbsoluteImageUrl } from '../../../../utils/image.utils';
import { formatDate } from '../../../../utils/date.utils';
import { formatPrice } from '../../../../utils/price.utils';
import styles from './adminOrderCard.module.css';

const AdminOrderCard = ({ 
    order, 
    onUpdateStatus,
    onViewOrder,
    orderItems = [],
    onOpenImageModal
}) => {
    const { settings } = useSettings();
    const currency = settings?.currency || 'ILS';
    const {
        id,
        orderNumber,
        customerName,
        customerEmail,
        totalAmount,
        status = 'pending',
        orderDate,
        items = [],
        shippingAddress = {},
        paymentStatus = 'paid'
    } = order;

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return styles.statusPending;
            case 'processing': return styles.statusProcessing;
            case 'shipped': return styles.statusShipped;
            case 'delivered': return styles.statusDelivered;
            case 'cancelled': return styles.statusCancelled;
            default: return styles.statusDefault;
        }
    };

    const orderImages = getOrderImages(orderItems, 1); // Only get first image

    // Get all images from all order items for modal
    const getAllOrderImages = () => {
        const allImages = [];
        orderItems.forEach(item => {
            const imageField = item.product_images || item.image_urls || item.images || item.img_url;
            const imageUrls = parseImageUrls(imageField).map((img) => getAbsoluteImageUrl(img));
            allImages.push(...imageUrls);
        });
        return allImages;
    };

    const handleImageClick = (e) => {
        e.stopPropagation();
        const allImages = getAllOrderImages();
        if (onOpenImageModal && allImages.length > 0) {
            onOpenImageModal(allImages, `Order ${orderNumber}`);
        }
    };

    return (
        <div className={styles.orderCard}>
            {/* Order Header */}
            <div className={styles.orderHeader}>
                <h3 className={styles.orderNumber}>{orderNumber}</h3>
                <span className={`${styles.status} ${getStatusColor(status)}`}>
                    {status}
                </span>
            </div>

            {/* Product Image Section */}
            {orderImages.length > 0 && (
                <div className={styles.orderImageSection}>
                    <div 
                        className={styles.productImageWrapper}
                        onClick={handleImageClick}
                    >
                        <img 
                            src={orderImages[0].url} 
                            alt={orderImages[0].productName}
                            className={styles.productImage}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <div className={styles.imageOverlay}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                        </div>
                        {orderItems.length > 1 && (
                            <div className={styles.imageCount}>
                                +{orderItems.length - 1}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Order Info */}
            <div className={styles.orderInfo}>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Email:</span>
                    <span className={styles.value}>{formatCustomerEmail(customerEmail)}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Date:</span>
                    <span className={styles.value}>{formatDate(orderDate, 'short')}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.label}>Total:</span>
                    <span className={styles.totalAmount}>{formatPrice(totalAmount, currency)}</span>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className={styles.orderActions}>
                <button
                    onClick={() => onViewOrder(order)}
                    className={styles.viewButton}
                >
                    View Details
                </button>
                
                <select
                    value={status}
                    onChange={(e) => onUpdateStatus(id, e.target.value)}
                    className={styles.statusSelect}
                >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
        </div>
    );
};

export default AdminOrderCard; 