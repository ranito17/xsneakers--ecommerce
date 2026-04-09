import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuthentication';
import { useLocation } from 'react-router-dom';
import { useToast } from '../components/common/toast';
import { orderApi } from '../services/orderApi';
import { messageApi } from '../services/messageApi';
import { OrderList, OrderDetails } from '../components/orders';
import { ImageModal, LoadingContainer, ErrorContainer } from '../components/contactForm';
import { parseImageUrls, getAbsoluteImageUrl } from '../utils/image.utils';
import { useNavigate } from 'react-router-dom';
import styles from './pages.module.css';

function OrderPage() {
    const { user,isAuthenticated } = useAuth();
    const navagate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError } = useToast();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedProductName, setSelectedProductName] = useState('');
    
    // fetchOrders - טוען את כל ההזמנות של המשתמש
    // שליחה לשרת: getUserOrders()
    // תגובה מהשרת: { success: true, data: [...] }
        const fetchOrders = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                const response = await orderApi.getUserOrders();
                if (response.success && response.data) {
                    setOrders(response.data);
                } else {
                    setOrders([]);
                }
            } catch (err) {
                setError('Failed to fetch orders');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };


    // handleViewDetails - טוען פרטי הזמנה ופותח מודל
    // שליחה לשרת: getOrderById(orderId), getOrderItems(orderId)
    // תגובה מהשרת: { success: true, data: {...} }, { success: true, data: [...] }
    const handleViewDetails = async (orderId) => {
        try {
            const orderDetails = await orderApi.getOrderById(orderId);
            const orderItemsData = await orderApi.getOrderItems(orderId);
            if (orderDetails.success && orderDetails.data) {
                setSelectedOrder(orderDetails.data);
            } else {
                setSelectedOrder(null);
            }
            if (orderItemsData.success && orderItemsData.data) {
                setOrderItems(orderItemsData.data);
            } else {
                setOrderItems([]);
            }
            setOrderDetailsModalOpen(true);
        } catch (err) {
            console.error('Error in handleViewDetails:', err);
            setError('Failed to fetch order details');
        }
    };


    // handleCloseOrderDetailsModal - סוגר מודל פרטי הזמנה
    const handleCloseOrderDetailsModal = () => {
        setOrderDetailsModalOpen(false);
        setSelectedOrder(null);
        setOrderItems([]);
    };


    // handleImageClick - פותח מודל תמונות מוצר
    const handleImageClick = (imageUrls, productName) => {
        const images = parseImageUrls(imageUrls).map(img => getAbsoluteImageUrl(img));
        if (images.length > 0) {
            setSelectedImages(images);
            setSelectedProductName(productName);
            setImageModalOpen(true);
        }
    };


    // handleCloseImageModal - סוגר מודל תמונות
    const handleCloseImageModal = () => {
        setImageModalOpen(false);
    };

    // handleContactSubmit - שולח הודעת קשר דחופה
    const handleContactSubmit = async (formData, orderId) => {
        try {
            const response = await messageApi.createMessage({
                messageType: formData.messageType || 'customer_to_admin_urgent',
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                subject: formData.subject,
                message: formData.message,
                orderId: orderId || null
            });

            if (response.success) {
                showSuccess('Your urgent message has been sent! We will get back to you shortly.');
            } else {
                showError(response.message || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting urgent message:', error);
            showError('Failed to send message. Please try again.');
        }
    };


    // handleDownloadReceipt - מוריד PDF קבלה להזמנה
    // שליחה לשרת: downloadOrderReceiptPDF(orderId)
    // תגובה מהשרת: PDF Buffer שנוריד כ-בלוב
    const handleDownloadReceipt = async (orderId) => {
        try {
            await orderApi.downloadOrderReceiptPDF(orderId);
            showSuccess('Receipt downloaded successfully!');
        } catch (error) {
            console.error('Error downloading receipt:', error);
            showError('Failed to download receipt. Please try again.');
        }
    };


    useEffect(() => {
        if(!isAuthenticated) {
            navagate('/login');
            return;
        }
        fetchOrders();
        
        // Check if there's an orderId in URL params (from payment page)
        const searchParams = new URLSearchParams(location.search);
        const orderIdParam = searchParams.get('orderId');
        if (orderIdParam) {
            // Scroll to the new order after orders are loaded
            setTimeout(() => {
                const orderElement = document.getElementById(`order-${orderIdParam}`);
                if (orderElement) {
                    orderElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight the order card briefly
                    orderElement.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    setTimeout(() => {
                        orderElement.style.boxShadow = '';
                    }, 2000);
                }
            }, 500);
        }
    }, [user?.id, location.search]);
        if (loading) {
        return (
                <LoadingContainer message="Loading your orders..." size="medium" />
        );
    }
        if (error) {
        return (
                <ErrorContainer 
                    message={error} 
                    onRetry={() => {
                        setError(null);
                        setLoading(true);
                        if (user?.id) {
                            orderApi.getUserOrders()
                                .then(response => {
                                    if (response.success && response.data) {
                                        setOrders(response.data);
                                    } else {
                                        setOrders([]);
                                    }
                                })
                                .catch(err => {
                                    setError('Failed to fetch orders');
                                    console.error('Error fetching orders:', err);
                                })
                                .finally(() => setLoading(false));
                        }
                    }}
                />
        );
    }
    return (
            <div className={styles.orderPage}>
                <div className={styles.orderPageContent}>
                    <h1 className={styles.orderPageTitle}>
                        Your Orders {orders.length > 0 && `(${orders.length})`}
                    </h1>
                    {orders.length === 0 ? (
                        <div className={styles.emptyOrdersState}>
                            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M9 11l3 3L22 4"/>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>
                            <h2>No Orders Yet</h2>
                            <p>Start shopping to see your orders here!</p>
                            <button
                                onClick={() => window.location.href = '/products'}
                                className={styles.startShoppingButton}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1"/>
                                    <circle cx="20" cy="21" r="1"/>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                </svg>
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <OrderList 
                            orders={orders} 
                            onViewDetails={handleViewDetails}
                            onDownloadReceipt={handleDownloadReceipt}
                        />
                    )}
                </div>
            <OrderDetails
                order={selectedOrder}
                orderItems={orderItems}
                user={user}
                onClose={handleCloseOrderDetailsModal}
                isOpen={orderDetailsModalOpen}
                onImageClick={handleImageClick}
                onContactSubmit={handleContactSubmit}
            />
            <ImageModal
                open={imageModalOpen}
                images={selectedImages}
                alt={selectedProductName}
                onClose={handleCloseImageModal}
            />
        </div>
    );
}

export default OrderPage;
