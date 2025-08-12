import React, { useState, useEffect } from 'react';
import { orderApi } from '../../services/orderApi';
import AdminOrderList from '../../components/adminOrderList/AdminOrderList';
import AdminOrderModal from '../../components/adminOrderModal/AdminOrderModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingContainer from '../../components/loading/LoadingContainer';
import ErrorContainer from '../../components/error/ErrorContainer';
import styles from './adminPages.module.css';

const OrderManagmentPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [orderItems, setOrderItems] = useState({});

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await orderApi.getAllOrders();
            console.log('Orders response:', response);
            
            if (response.success) {
                setOrders(response.data || []);
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

    // Fetch order items for a specific order
    const fetchOrderItems = async (orderId) => {
        try {
            const response = await orderApi.getOrderItems(orderId);
            console.log('Order items response:', response);
            
            if (response.success) {
                setOrderItems(prev => ({
                    ...prev,
                    [orderId]: response.data || []
                }));
            }
        } catch (error) {
            console.error('Error fetching order items:', error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const response = await orderApi.updateOrderStatus(orderId, newStatus);
            
            if (response.success) {
                // Update local state
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.order_id === orderId ? { ...order, status: newStatus } : order
                    )
                );
            } else {
                setError(response.message || 'Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            setError('Failed to update order status');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                const response = await orderApi.deleteOrder(orderId);
                
                if (response.message) {
                    // Update local state
                    setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
                } else {
                    setError('Failed to delete order');
                }
            } catch (error) {
                console.error('Error deleting order:', error);
                setError('Failed to delete order');
            }
        }
    };

    const handleViewOrderDetails = async (order) => {
        // Find the original API order data
        const originalOrder = orders.find(o => o.order_id === order.id);
        setSelectedOrder(originalOrder);
        setShowOrderDetails(true);
        
        // Fetch order items if not already loaded
        if (!orderItems[originalOrder.order_id]) {
            await fetchOrderItems(originalOrder.order_id);
        }
    };

    const handleEditOrder = (order) => {
        // Find the original API order data
        const originalOrder = orders.find(o => o.order_id === order.id);
        setEditingOrder(originalOrder);
        setShowEditModal(true);
    };

    const handleSaveOrder = async (updatedData) => {
        try {
            setEditLoading(true);
            const response = await orderApi.updateOrder(editingOrder.order_id, updatedData);
            
            if (response.success) {
                // Update local state
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.order_id === editingOrder.order_id 
                            ? { ...order, ...updatedData }
                            : order
                    )
                );
                setShowEditModal(false);
                setEditingOrder(null);
                setError(null);
            } else {
                setError(response.message || 'Failed to update order');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            setError(error.response?.data?.message || 'Failed to update order');
        } finally {
            setEditLoading(false);
        }
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingOrder(null);
        setEditLoading(false);
    };

    // Transform API data to match component expectations
    const transformOrdersForComponents = (apiOrders) => {
        return apiOrders.map(order => ({
            id: order.order_id,
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            totalAmount: parseFloat(order.total_amount),
            status: order.status || 'pending',
            orderDate: order.created_at,
            paymentStatus: order.payment_status,
            shippingAddress: {
                street: order.shipping_address,
                city: '', // Not available in current API
                state: '', // Not available in current API
                zipCode: '' // Not available in current API
            },
            items: orderItems[order.order_id] || []
        }));
    };

    // Filter orders based on search and status
    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch = 
            (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesStatus && matchesSearch;
    });

    const transformedOrders = transformOrdersForComponents(filteredOrders);

    if (loading) {
        return <LoadingContainer message="Loading orders..." size="medium" />;
    }

    return (
        <ProtectedRoute requiredRole="admin">
            <div className={styles.orderManagement}>
                <div className={styles.orderMainContent}>
                <div className={styles.orderPageHeader}>
                    <div className={styles.orderHeaderContent}>
                        <h1>Order Management</h1>
                        <p>Manage and track all customer orders</p>
                    </div>
                    <div className={styles.orderStats}>
                        <div className={styles.orderStatItem}>
                            <span className={styles.orderStatNumber}>{orders.length}</span>
                            <span className={styles.orderStatLabel}>Total Orders</span>
                        </div>
                        <div className={styles.orderStatItem}>
                            <span className={styles.orderStatNumber}>
                                {orders.filter(o => o.status === 'pending').length}
                            </span>
                            <span className={styles.orderStatLabel}>Pending</span>
                        </div>
                        <div className={styles.orderStatItem}>
                            <span className={styles.orderStatNumber}>
                                {orders.filter(o => o.status === 'shipped').length}
                            </span>
                            <span className={styles.orderStatLabel}>Shipped</span>
                        </div>
                    </div>
                </div>

                <div className={styles.orderControlsSection}>
                    <div className={styles.orderSearchContainer}>
                        <div className={styles.orderSearchInput}>
                            <input
                                type="text"
                                placeholder="Search orders by number, customer name, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={styles.orderSearchField}
                            />
                        </div>
                    </div>
                    
                    <div className={styles.orderFilterContainer}>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className={styles.orderFilterSelect}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <ErrorContainer 
                        message={error}
                        onRetry={fetchOrders}
                    />
                )}

                <div className={styles.orderContentArea}>
                    {/* Use AdminOrderList component */}
                    <AdminOrderList
                        orders={transformedOrders}
                        loading={loading}
                        error={error}
                        onViewDetails={handleViewOrderDetails}
                        onUpdateStatus={handleStatusUpdate}
                        onDeleteOrder={handleDeleteOrder}
                        onEditOrder={handleEditOrder}
                    />
                </div>

                {/* Order Details Modal */}
                {showOrderDetails && selectedOrder && (
                    <div className={styles.orderModalOverlay} onClick={() => setShowOrderDetails(false)}>
                        <div className={styles.orderModal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.orderModalHeader}>
                                <h2>Order Details - {selectedOrder.order_number}</h2>
                                <button 
                                    onClick={() => setShowOrderDetails(false)}
                                    className={styles.orderModalClose}
                                >
                                    ×
                                </button>
                            </div>
                            <div className={styles.orderModalContent}>
                                <div className={styles.orderModalSection}>
                                    <h3>Customer Information</h3>
                                    <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                                    <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                                    <p><strong>Address:</strong> {selectedOrder.shipping_address}</p>
                                </div>
                                
                                <div className={styles.orderModalSection}>
                                    <h3>Order Information</h3>
                                    <p><strong>Order Number:</strong> {selectedOrder.order_number}</p>
                                    <p><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</p>
                                    <p><strong>Status:</strong> {selectedOrder.status}</p>
                                    <p><strong>Payment Status:</strong> {selectedOrder.payment_status}</p>
                                    <p><strong>Total Amount:</strong> ${parseFloat(selectedOrder.total_amount).toFixed(2)}</p>
                                    {selectedOrder.tracking_number && (
                                        <p><strong>Tracking Number:</strong> {selectedOrder.tracking_number}</p>
                                    )}
                                    {selectedOrder.arrival_date_estimated && (
                                        <p><strong>Estimated Delivery:</strong> {new Date(selectedOrder.arrival_date_estimated).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    )}
                                </div>
                                
                                <div className={styles.orderModalSection}>
                                    <h3>Order Items</h3>
                                    {orderItems[selectedOrder.order_id] ? (
                                        <div className={styles.orderModalItems}>
                                            {orderItems[selectedOrder.order_id].map((item, index) => (
                                                <div key={index} className={styles.orderModalItem}>
                                                    <span className={styles.orderItemName}>{item.product_name}</span>
                                                    <span className={styles.orderItemQuantity}>x{item.quantity}</span>
                                                    <span className={styles.orderItemPrice}>${parseFloat(item.product_price).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>Loading items...</p>
                                    )}
                                    <div className={styles.orderModalTotal}>
                                        <strong>Total: ${parseFloat(selectedOrder.total_amount).toFixed(2)}</strong>
                                    </div>
                                </div>
                                
                                <div className={styles.orderModalSection}>
                                    <h3>Order Status</h3>
                                    <select
                                        value={selectedOrder.status || 'pending'}
                                        onChange={(e) => handleStatusUpdate(selectedOrder.order_id, e.target.value)}
                                        className={styles.orderModalStatusSelect}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Order Modal */}
                <AdminOrderModal
                    isOpen={showEditModal}
                    onClose={handleCloseEditModal}
                    order={editingOrder}
                    onSave={handleSaveOrder}
                    loading={editLoading}
                />
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default OrderManagmentPage;
