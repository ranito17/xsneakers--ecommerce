import React, { useState, useEffect } from 'react';
import { useSettings } from '../../../../context/SettingsProvider';
import { orderApi } from '../../../../services/orderApi';
import { formatAddress, getProductImage, formatSizeDisplay } from '../../../../utils/order.utils';
import { formatPrice } from '../../../../utils/price.utils';
import { ImageModal } from '../../../contactForm';
import { parseImageUrls, getAbsoluteImageUrl } from '../../../../utils/image.utils';
import styles from './adminOrderModal.module.css';

/**
 * מודל הזמנה למנהל - AdminOrderModal
 * 
 * מציג מודל עם פרטי הזמנה מלאים
 * מקבלת orderItems כ-prop מהדף העליון (לא עושה API calls בעצמה)
 * 
 * @param {boolean} isOpen - האם המודל פתוח
 * @param {Function} onClose - פונקציה לסגירת המודל
 * @param {Object} order - אובייקט ההזמנה
 * @param {Array} orderItems - מערך פריטי ההזמנה (מהדף העליון)
 * @param {Function} onSave - פונקציה לשמירת שינויים
 * @param {boolean} loading - מצב טעינה
 * @param {boolean} readOnly - האם המודל לקריאה בלבד
 */
const AdminOrderModal = ({ 
    isOpen, 
    onClose, 
    order, 
    orderItems: orderItemsProp = [],
    onSave, 
    loading = false,
    readOnly = false
}) => {
    const { settings } = useSettings();
    const currency = settings?.currency || 'ILS';
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        shipping_address: '',
        status: 'pending',
        payment_status: 'pending',
        arrival_date_estimated: '',
        total_amount: 0
    });
    const [orderItems, setOrderItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    
    // אם orderItems מגיעים כ-prop, משתמשים בהם
    // אחרת, טוענים אותם (לתאימות לאחור)
    const shouldFetchItems = !orderItemsProp || orderItemsProp.length === 0;
    
    // Image modal state
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedProductName, setSelectedProductName] = useState('');

    // Helper function to parse and format address
    const parseAndFormatAddress = (address) => {
        if (!address) return '';
        
        // If it's already an object (parsed by backend), format it directly
        if (typeof address === 'object' && address !== null) {
            return formatAddress(address);
        }
        
        // If it's a JSON string, parse it first
        if (typeof address === 'string' && address.trim()) {
            try {
                const parsed = JSON.parse(address);
                if (typeof parsed === 'object' && parsed !== null) {
                    return formatAddress(parsed);
                } else {
                    return '';
                }
            } catch (e) {
                // Not valid JSON, might be already formatted string - return as is
                return address;
            }
        }
        
        return '';
    };

    useEffect(() => {
        if (order) {
            // Parse shipping address from order (comes as object or JSON string from backend)
            let shippingAddress = order.shipping_address || null;
            let shippingAddressDisplay = '';
            
            // Try to get address from order first
            if (shippingAddress) {
                shippingAddressDisplay = parseAndFormatAddress(shippingAddress);
            }
            
            setFormData({
                customer_name: order.customer_name || '',
                customer_email: order.customer_email || '',
                shipping_address: shippingAddressDisplay,
                status: order.status || 'pending',
                payment_status: order.payment_status || 'pending',
                arrival_date_estimated: order.arrival_date_estimated ? new Date(order.arrival_date_estimated).toISOString().split('T')[0] : '',
                total_amount: parseFloat(order.total_amount) || 0
            });
            
            // אם orderItems מגיעים כ-prop, משתמשים בהם
            // אחרת, טוענים אותם (לתאימות לאחור)
            if (orderItemsProp && orderItemsProp.length > 0) {
                setOrderItems(prev => {
                    // Only update if items actually changed
                    const prevString = JSON.stringify(prev);
                    const newString = JSON.stringify(orderItemsProp);
                    if (prevString === newString) {
                        return prev;
                    }
                    return orderItemsProp;
                });
            } else if (shouldFetchItems && order?.order_id) {
                fetchOrderItems();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order?.order_id, orderItemsProp?.length]);

    // Update address from order items (this is the primary source since address is stored with order)
    useEffect(() => {
        if (orderItems && orderItems.length > 0) {
            // Get address from first order item (all items should have the same address from the order)
            const itemAddress = orderItems[0]?.shipping_address;
            if (itemAddress) {
                const formattedAddress = parseAndFormatAddress(itemAddress);
                // Always update with address from order items since it's the source of truth
                if (formattedAddress) {
                    setFormData(prev => {
                        // Only update if it's different to avoid unnecessary re-renders
                        if (prev.shipping_address !== formattedAddress) {
                            return {
                                ...prev,
                                shipping_address: formattedAddress
                            };
                        }
                        return prev;
                    });
                }
            }
        }
    }, [orderItems]);

    const fetchOrderItems = async () => {
        if (!order?.order_id) return;
        
        try {
            setItemsLoading(true);
            const response = await orderApi.getOrderItems(order.order_id);
            if (response.success) {
                setOrderItems(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching order items:', error);
        } finally {
            setItemsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    // Use formatPrice from utils with settings currency
    const formatPriceWithCurrency = (price) => {
        return formatPrice(price, currency);
    };

    // Image modal handlers
    const handleImageClick = (imageUrls, productName) => {
        const images = parseImageUrls(imageUrls).map(img => getAbsoluteImageUrl(img));
        if (images.length > 0) {
            setSelectedImages(images);
            setSelectedProductName(productName);
            setImageModalOpen(true);
        }
    };

    const handleCloseImageModal = () => {
        setImageModalOpen(false);
        setSelectedImages([]);
        setSelectedProductName('');
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{readOnly ? 'View' : 'Edit'} Order - {order?.order_number}</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>
                
                <div className={styles.modalContent}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formSection}>
                            <h3>Customer Information</h3>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="customer_name">Customer Name</label>
                                    <input
                                        type="text"
                                        id="customer_name"
                                        name="customer_name"
                                        value={formData.customer_name}
                                        onChange={handleInputChange}
                                        required
                                        className={styles.input}
                                        disabled={readOnly}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="customer_email">Customer Email</label>
                                    <input
                                        type="email"
                                        id="customer_email"
                                        name="customer_email"
                                        value={formData.customer_email}
                                        onChange={handleInputChange}
                                        required
                                        className={styles.input}
                                        disabled={readOnly}
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="shipping_address">Shipping Address</label>
                                {readOnly ? (
                                    <div className={styles.readOnlyField}>
                                        {formData.shipping_address || 'N/A'}
                                    </div>
                                ) : (
                                    <textarea
                                        id="shipping_address"
                                        name="shipping_address"
                                        value={formData.shipping_address}
                                        onChange={handleInputChange}
                                        required
                                        className={styles.textarea}
                                        rows="3"
                                        placeholder="Enter full address (e.g., 123 Main St, New York, 10001)"
                                    />
                                )}
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3>Order Information</h3>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="status">Order Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className={styles.select}
                                        disabled={readOnly}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="payment_status">Payment Status</label>
                                    <select
                                        id="payment_status"
                                        name="payment_status"
                                        value={formData.payment_status}
                                        onChange={handleInputChange}
                                        className={styles.select}
                                        disabled={readOnly}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="arrival_date_estimated">Estimated Delivery Date</label>
                                    <input
                                        type="date"
                                        id="arrival_date_estimated"
                                        name="arrival_date_estimated"
                                        value={formData.arrival_date_estimated}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        disabled={readOnly}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="total_amount">Total Amount</label>
                                    <input
                                        type="number"
                                        id="total_amount"
                                        name="total_amount"
                                        value={formData.total_amount}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className={styles.input}
                                        disabled={readOnly}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Items Section */}
                        <div className={styles.formSection}>
                            <h3>Order Items ({orderItems.length})</h3>
                            {itemsLoading ? (
                                <div className={styles.itemsLoading}>
                                    <div className={styles.spinner}></div>
                                    <p>Loading order items...</p>
                                </div>
                            ) : orderItems.length > 0 ? (
                                <div className={styles.itemsList}>
                                    {orderItems.map((item, index) => (
                                        <div key={`${item.product_id}-${index}`} className={styles.itemCard}>
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
                                                            e.target.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                    <div className={styles.imageHoverOverlay}>
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="11" cy="11" r="8"/>
                                                            <path d="m21 21-4.35-4.35"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Product Details */}
                                            <div className={styles.itemDetails}>
                                                <h4 className={styles.productName}>{item.product_name}</h4>
                                                
                                                <div className={styles.productMeta}>
                                                    <div className={styles.metaItem}>
                                                        <span className={styles.metaLabel}>Price:</span>
                                                        <span className={styles.metaValue}>{formatPriceWithCurrency(item.product_price)}</span>
                                                    </div>
                                                    {item.quantity && (
                                                        <div className={styles.metaItem}>
                                                            <span className={styles.metaLabel}>Qty:</span>
                                                            <span className={styles.metaValue}>{item.quantity}</span>
                                                        </div>
                                                    )}
                                                    {item.selected_size && (
                                                        <div className={styles.metaItem}>
                                                            <span className={styles.metaLabel}>Size:</span>
                                                            <span className={styles.metaValue}>{formatSizeDisplay(item.selected_size)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Item Total */}
                                                <div className={styles.itemTotal}>
                                                    <span className={styles.itemTotalLabel}>Subtotal:</span>
                                                    <span className={styles.itemTotalValue}>
                                                        {formatPriceWithCurrency(item.product_price * (item.quantity || 1))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.noItems}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="9" cy="21" r="1"/>
                                        <circle cx="20" cy="21" r="1"/>
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                    </svg>
                                    <p>No items found for this order.</p>
                                </div>
                            )}
                        </div>

                        {!readOnly && (
                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={styles.cancelButton}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.saveButton}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Image Modal */}
                <ImageModal
                    open={imageModalOpen}
                    images={selectedImages}
                    alt={selectedProductName}
                    onClose={handleCloseImageModal}
                />
            </div>
        </div>
    );
};

export default AdminOrderModal;
