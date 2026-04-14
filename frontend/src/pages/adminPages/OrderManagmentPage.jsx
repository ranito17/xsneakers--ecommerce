import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuthentication';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../components/common/toast';
import { orderApi } from '../../services/orderApi';
import { AdminOrderList, AdminOrderModal, OrderFilterModal } from '../../components/admin/orders';
import { SearchBar } from '../../components/admin/common';
import ProtectedRoute from '../../components/ProtectedRoute';
import { LoadingContainer, ErrorContainer, ImageModal } from '../../components/contactForm';
import { filterOrders, sortOrders, getAllAvailableSizes } from '../../utils/order.utils';
import styles from './adminPages.module.css';

const OrderManagmentPage = () => {
    const { isAuthenticated, user } = useAuth();
    const { showSuccess, showError, showConfirmation } = useToast();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState({});
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedProductName, setSelectedProductName] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        sizes: [],
        minTotal: '',
        maxTotal: '',
        productSearch: '',
        startDate: '',
        endDate: '',
        minQuantity: '',
        maxQuantity: '',
        sortBy: 'created_at',
        sortOrder: 'desc'
    });

    // fetchOrders - טוען את כל ההזמנות ופריטי ההזמנות מהשרת
    // שליחה לשרת: getAllOrders(), getOrderItems(orderId) לכל הזמנה
    // תגובה מהשרת: { success: true, data: [...] }, { success: true, data: [...] }
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await orderApi.getAllOrders();
            if (response.success) {
                const ordersData = response.data || [];
                setOrders(ordersData);
                const itemsData = {};
                for (const order of ordersData) {
                    try {
                        const itemsResponse = await orderApi.getOrderItems(order.order_id);
                        if (itemsResponse.success) {
                            itemsData[order.order_id] = itemsResponse.data || [];
                        }
                    } catch (error) {
                        console.error(`Error fetching items for order ${order.order_id}:`, error);
                        itemsData[order.order_id] = [];
                    }
                }
                setOrderItems(itemsData);
            } else {
                setError('Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.response?.data?.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };


    // handleStatusUpdate - מעדכן סטטוס הזמנה
    // שליחה לשרת: updateOrderStatus(orderId, newStatus)
    // תגובה מהשרת: { success: true }
    const handleStatusUpdate = async (orderId, newStatus) => {
        const order = orders.find(o => o.order_id === orderId);
        const orderNumber = order?.order_number || `Order #${orderId}`;
        const currentStatus = order?.status || 'pending';
        const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        const currentStatusLabel = currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
        
        // Show confirmation if status is being changed
        if (currentStatus !== newStatus) {
            const confirmed = await showConfirmation(
                `Change order ${orderNumber} status from "${currentStatusLabel}" to "${statusLabel}"?`
            );
            if (!confirmed) {
                return;
            }
        }
        
        try {
            const response = await orderApi.updateOrderStatus(orderId, newStatus);
            if (response.success) {
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.order_id === orderId ? { ...order, status: newStatus } : order
                    )
                );
                showSuccess(`Order ${orderNumber} status updated to ${statusLabel} successfully!`);
            } else {
                const errorMessage = response.message || 'Failed to update order status';
                setError(errorMessage);
                showError(errorMessage);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update order status';
            setError(errorMessage);
            showError(errorMessage);
        }
    };


    // handleViewOrder - פותח מודל הזמנה
    const handleViewOrder = (order) => {
        const originalOrder = orders.find(o => o.order_id === order.id);
        if (!originalOrder) {
            console.error('Original order not found for ID:', order.id);
            return;
        }
        setSelectedOrder(originalOrder);
        setShowOrderModal(true);
    };


    // handleCloseOrderModal - סוגר מודל הזמנה
    const handleCloseOrderModal = () => {
        setShowOrderModal(false);
        setSelectedOrder(null);
    };


    // handleOpenFilterModal - פותח מודל פילטרים
    const handleOpenFilterModal = () => {
        setShowFilterModal(true);
    };


    // handleCloseFilterModal - סוגר מודל פילטרים
    const handleCloseFilterModal = () => {
        setShowFilterModal(false);
    };


    // handleApplyFilters - מחיל פילטרים חדשים
    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
    };


    // getActiveFiltersCount - מחזיר את מספר הפילטרים הפעילים
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.status && filters.status !== 'all') {
            count++;
        }
        if (filters.sizes && filters.sizes.length > 0) {
            count++;
        }
        if (filters.minTotal || filters.maxTotal) {
            count++;
        }
        if (filters.productSearch) {
            count++;
        }
        if (filters.startDate || filters.endDate) {
            count++;
        }
        if (filters.minQuantity || filters.maxQuantity) {
            count++;
        }
        return count;
    };


    // handleOpenImageModal - פותח מודל תמונות מוצר
    const handleOpenImageModal = (images, productName) => {
        setSelectedImages(images);
        setSelectedProductName(productName);
        setImageModalOpen(true);
    };


    // handleCloseImageModal - סוגר מודל תמונות
    const handleCloseImageModal = () => {
        setImageModalOpen(false);
        setSelectedImages([]);
        setSelectedProductName('');
    };


    useEffect(() => {
        if (isAuthenticated && user) {
            fetchOrders();
        }
    }, [isAuthenticated, user]);


    useEffect(() => {
        if (location.state?.statusFilter) {
            setFilters(prev => ({
                ...prev,
                status: location.state.statusFilter
            }));
        }
        if (location.state?.userFilter) {
            const { userFilter } = location.state;
            setSearchTerm(userFilter.userEmail);
        }
    }, [location.state]);


    const transformOrdersForComponents = (apiOrders) => {
        return apiOrders.map(order => {
            let shippingAddressObj = order.shipping_address || null;
            if (typeof shippingAddressObj === 'string' && shippingAddressObj.trim()) {
                try {
                    shippingAddressObj = JSON.parse(shippingAddressObj);
                } catch (e) {
                    shippingAddressObj = null;
                }
            }
            return {
                id: order.order_id,
                orderNumber: order.order_number,
                customerName: order.customer_name,
                customerEmail: order.customer_email,
                totalAmount: parseFloat(order.total_amount),
                status: order.status || 'pending',
                orderDate: order.created_at,
                paymentStatus: order.payment_status,
                shippingAddress: shippingAddressObj || {}
            };
        });
    };
    const getProcessedOrders = () => {
        let searchFiltered = orders.filter(order => {
            const matchesSearch = 
                (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
        const filtered = filterOrders(searchFiltered, {
            ...filters,
            orderItems
        });
        const sorted = sortOrders(filtered, filters.sortBy, filters.sortOrder);
        return sorted;
    };
    const processedOrders = getProcessedOrders();
    const transformedOrders = transformOrdersForComponents(processedOrders);
    return (
        <ProtectedRoute requiredRole="admin">
            {loading ? (
                <LoadingContainer message="Loading orders..." size="medium" />
            ) : (
            <div className={styles.orderManagement}>
                <div className={styles.orderMainContent}>
                    {location.state?.userFilter && (
                        <div className={styles.userFilterInfo}>
                            <p>Orders for {location.state.userFilter.userEmail}</p>
                            <button 
                                onClick={() => {
                                    setSearchTerm('');
                                    window.history.replaceState({}, document.title);
                                }}
                                className={styles.clearUserFilterBtn}
                            >
                                Clear Filter
                            </button>
                        </div>
                    )}
                    <div className={styles.orderFilterInfo}>
                        <SearchBar
                            count={processedOrders.length}
                            totalCount={orders.length}
                            itemName="order"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClear={() => setSearchTerm('')}
                        />
                        <div className={styles.orderControlsRight}>
                            <button
                                onClick={handleOpenFilterModal}
                                className={styles.filterButton}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                                </svg>
                                <span>
                                    {getActiveFiltersCount() > 0 
                                        ? `${getActiveFiltersCount()} filter${getActiveFiltersCount() > 1 ? 's' : ''}`
                                        : 'Filters & Sort'
                                    }
                                </span>
                            </button>
                        </div>
                    </div>
                    {error && (
                        <ErrorContainer 
                            message={error}
                            onRetry={fetchOrders}
                        />
                    )}
                    <AdminOrderList
                        orders={transformedOrders}
                        orderItems={orderItems}
                        loading={loading}
                        error={error}
                        onUpdateStatus={handleStatusUpdate}
                        onViewOrder={handleViewOrder}
                        onOpenImageModal={handleOpenImageModal}
                    />
                    <OrderFilterModal
                        isOpen={showFilterModal}
                        onClose={handleCloseFilterModal}
                        onApplyFilters={handleApplyFilters}
                        availableSizes={getAllAvailableSizes(orderItems)}
                        allProducts={[]}
                        orders={orders}
                        orderItems={orderItems}
                    />
                    {showOrderModal && selectedOrder && (
                        <AdminOrderModal
                            isOpen={showOrderModal}
                            onClose={handleCloseOrderModal}
                            order={selectedOrder}
                            orderItems={orderItems[selectedOrder.order_id] || []}
                            readOnly={true}
                        />
                    )}
                    <ImageModal
                        open={imageModalOpen}
                        images={selectedImages}
                        alt={selectedProductName}
                        onClose={handleCloseImageModal}
                    />
                </div>
            </div>
            )}
        </ProtectedRoute>
    );
};

export default OrderManagmentPage;
