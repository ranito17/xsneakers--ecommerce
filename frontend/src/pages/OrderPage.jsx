import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuthentication';
import { orderApi } from '../services/orderApi';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import OrderList from '../components/orderList/OrderList';
import OrderDetails from '../components/orderDetails/OrderDetails';
import ImageModal from '../components/imageModal/ImageModal';
import LoadingContainer from '../components/loading/LoadingContainer';
import ErrorContainer from '../components/error/ErrorContainer';
import styles from './pages.module.css';

function OrderPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Image Modal state
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedProductName, setSelectedProductName] = useState('');
    
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.id) return;
            
            try {
                setLoading(true);
                const response = await orderApi.getUserOrders(user.id);
                // Extract the data array from the response
                if (response.success && response.data) {
                    setOrders(response.data);
                } else {
                    setOrders([]);
                }
                console.log(response);
            } catch (err) {
                setError('Failed to fetch orders');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user?.id]);

    const handleViewDetails = async (orderId) => {
        try {
            // Fetch order details and items
            const orderDetails = await orderApi.getOrderById(orderId);
            const orderItemsData = await orderApi.getOrderItems(orderId);
            
            // Extract the actual order data from the response
            if (orderDetails.success && orderDetails.data) {
                setSelectedOrder(orderDetails.data);
            } else {
                setSelectedOrder(null);
            }
            
            // Extract the actual order items data from the response
            if (orderItemsData.success && orderItemsData.data) {
                setOrderItems(orderItemsData.data);
            } else {
                setOrderItems([]);
            }
        } catch (err) {
            setError('Failed to fetch order details');
            console.error('Error fetching order details:', err);
        }
    };

    const handleBackToList = () => {
        setSelectedOrder(null);
        setOrderItems([]);
    };

    // Image Modal handlers
    const handleImageClick = (imageUrls, productName) => {
        if (imageUrls) {
            const images = imageUrls.split(',').map(url => url.trim()).filter(Boolean);
            
            if (images.length > 0) {
                setSelectedImages(images);
                setSelectedProductName(productName);
                setImageModalOpen(true);
            }
        }
    };

    const handleCloseImageModal = () => {
        setImageModalOpen(false);
    };

        if (loading) {
        return (
            <>
             
                <LoadingContainer message="Loading your orders..." size="medium" />
                
            </>
        );
    }

        if (error) {
        return (
            <>
                <Header />
                <ErrorContainer 
                    message={error} 
                    onRetry={() => {
                        setError(null);
                        setLoading(true);
                        // Re-fetch orders
                        if (user?.id) {
                            orderApi.getUserOrders(user.id)
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
                <Footer />
            </>
        );
    }

    return (
        <>
       
            <div className={styles.orderPage}>
                <div className={styles.orderPageContent}>
                    <h1 className={styles.orderPageTitle}>Your Orders</h1>
                    
                    {selectedOrder ? (
                        <div>
                            <button 
                                className={styles.orderPageBackButton}
                                onClick={handleBackToList}
                            >
                                ← Back to Orders
                            </button>
                            <OrderDetails 
                                order={selectedOrder} 
                                orderItems={orderItems}
                                user={user}
                                onImageClick={handleImageClick}
                            />
                        </div>
                    ) : (
                        <OrderList 
                            orders={orders} 
                            onViewDetails={handleViewDetails} 
                        />
                    )}
                </div>
            </div>
         
            
            {/* Image Modal - at page level to avoid nesting issues */}
            <ImageModal
                open={imageModalOpen}
                images={selectedImages}
                alt={selectedProductName}
                onClose={handleCloseImageModal}
            />
        </>
    );
}

export default OrderPage;