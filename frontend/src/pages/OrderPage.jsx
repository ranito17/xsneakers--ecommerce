import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { orderApi } from '../services/orderApi';
import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';
import OrderList from '../components/orderList/OrderList';
import OrderDetails from '../components/orderDetails/OrderDetails';
import ImageModal from '../components/imageModal/ImageModal';
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
            
            setSelectedOrder(orderDetails);
            setOrderItems(orderItemsData);
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
                <Header />
                <div className={styles.orderPage}>
                    <div className={styles.orderPageLoading}>
                        <div className={styles.spinner}></div>
                        <p>Loading your orders...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className={styles.orderPage}>
                    <div className={styles.orderPageError}>
                        <h3>Error</h3>
                        <p>{error}</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
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
            <Footer />
            
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