import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuthentication';
import { useNavigate } from 'react-router-dom';
import { orderApi, productApi } from '../../services/index';
import LoadingContainer from '../../components/loading/LoadingContainer';
import ErrorContainer from '../../components/error/ErrorContainer';
import StatusCard from '../../components/dashboard/StatusCard';
import RecentOrders from '../../components/dashboard/RecentOrders';
import LowStockAlert from '../../components/dashboard/LowStockAlert';
import TopProducts from '../../components/dashboard/TopProducts';
import ProductDetailsModal from '../../components/dashboard/ProductDetailsModal';
import ProductModal from '../../components/productModal/ProductModal';
import OrderDetails from '../../components/orderDetails/OrderDetails';
import StockRefuelModal from '../../components/dashboard/StockRefuelModal';
import styles from './adminPages.module.css';

const DashboardPage = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal states
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isStockRefuelModalOpen, setIsStockRefuelModalOpen] = useState(false);
    
    const [dashboardData, setDashboardData] = useState({
        orderStats: {
            total_orders: 0,
            total_revenue: 0,
            pending_orders: 0,
            processing_orders: 0,
            shipped_orders: 0,
            delivered_orders: 0,
            cancelled_orders: 0
        },
        recentOrders: [],
        topProducts: [],
        lowStockProducts: [],
        productStats: {
            total_products: 0,
            total_categories: 0,
            total_stock: 0,
            avg_price: 0
        }
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchDashboardData();
        }
    }, [isAuthenticated, user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all dashboard data in parallel
            const [orderStatsResponse, lowStockResponse, productStatsResponse] = await Promise.all([
                orderApi.getDashboardStats(),
                productApi.getLowStockProducts(10),
                productApi.getProductStats()
            ]);

            if (orderStatsResponse.success) {
                setDashboardData(prev => ({
                    ...prev,
                    orderStats: orderStatsResponse.data.orderStats,
                    recentOrders: orderStatsResponse.data.recentOrders,
                    topProducts: orderStatsResponse.data.topProducts
                }));
            }

            if (lowStockResponse.success) {
                setDashboardData(prev => ({
                    ...prev,
                    lowStockProducts: lowStockResponse.data
                }));
            }

            if (productStatsResponse.success) {
                setDashboardData(prev => ({
                    ...prev,
                    productStats: productStatsResponse.data.productStats
                }));
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleLowStockThresholdChange = async (threshold) => {
        try {
            const response = await productApi.getLowStockProducts(threshold);
            if (response.success) {
                setDashboardData(prev => ({
                    ...prev,
                    lowStockProducts: response.data
                }));
            }
        } catch (error) {
            console.error('Error updating low stock threshold:', error);
        }
    };

    const handleStatusCardClick = (status) => {
        // Navigate to order management page with status filter
        navigate('/admin/orders', { state: { statusFilter: status } });
    };

    // Quick action button handlers
    const handleAddProduct = () => {
        setIsAddProductModalOpen(true);
    };

    const handleCloseAddProductModal = () => {
        setIsAddProductModalOpen(false);
        // Refresh dashboard data after adding product
        fetchDashboardData();
    };

    const handleViewAllOrders = () => {
        navigate('/admin/orders');
    };

    const handleSettings = () => {
        navigate('/admin/settings');
    };

    const handleManageUsers = () => {
        // TODO: Implement user management
        console.log('User management will be implemented later');
    };

    const handleStockRefuel = () => {
        setIsStockRefuelModalOpen(true);
    };

    const handleCloseStockRefuelModal = () => {
        setIsStockRefuelModalOpen(false);
    };

    const handleStockRefuelSuccess = () => {
        // Refresh dashboard data after successful refuel request
        fetchDashboardData();
    };

    // Order modal handlers
    const handleOrderClick = async (order) => {
        try {
            // Fetch order details and items
            const orderDetails = await orderApi.getOrderById(order.order_id);
            const orderItemsData = await orderApi.getOrderItems(order.order_id);
            
            if (orderDetails.success && orderDetails.data) {
                console.log('Order details found:', orderDetails.data);
                setSelectedOrder(orderDetails.data);
            } else {
                console.log('Order details not found:', orderDetails);
                setSelectedOrder(order);
            }
            
            if (orderItemsData.success && orderItemsData.data) {
                setOrderItems(orderItemsData.data);
            } else {
                setOrderItems([]);
            }
            
            setIsOrderModalOpen(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
            // Fallback to basic order data
            setSelectedOrder(order);
            setOrderItems([]);
            setIsOrderModalOpen(true);
        }
    };

    const handleCloseOrderModal = () => {
        setIsOrderModalOpen(false);
        setSelectedOrder(null);
        setOrderItems([]);
    };

    // Product modal handlers
    const handleProductClick = async (product) => {
        try {
            // Fetch full product details
            const productDetails = await productApi.getProductById(product.id);
            if (productDetails.success && productDetails.data) {
                console.log('Product details found:', productDetails.data);
                setSelectedProduct(productDetails.data);
            } else {
                setSelectedProduct(product);
            }
            setIsProductModalOpen(true);
        } catch (error) {
            console.error('Error fetching product details:', error);
            // Fallback to basic product data
            setSelectedProduct(product);
            setIsProductModalOpen(true);
        }
    };

    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
        setSelectedProduct(null);
    };

    if (loading) {
        return <LoadingContainer message="Loading dashboard..." size="large" />;
    }

    if (error) {
        return (
            <ErrorContainer 
                message={error}
                onRetry={fetchDashboardData}
            />
        );
    }

    const { orderStats, recentOrders, topProducts, lowStockProducts, productStats } = dashboardData;

    return (
        <div className={styles.dashboardPage}>
            <div className={styles.dashboardMainContent}>
                {/* Order Status Cards */}
                <div className={styles.statusSection}>
                    <h2>Order Status Overview</h2>
                    <div className={styles.statusGrid}>
                        <StatusCard 
                            status="pending" 
                            count={orderStats.pending_orders || 0}
                            onClick={handleStatusCardClick}
                        />
                        <StatusCard 
                            status="processing" 
                            count={orderStats.processing_orders || 0}
                            onClick={handleStatusCardClick}
                        />
                        <StatusCard 
                            status="shipped" 
                            count={orderStats.shipped_orders || 0}
                            onClick={handleStatusCardClick}
                        />
                        <StatusCard 
                            status="delivered" 
                            count={orderStats.delivered_orders || 0}
                            onClick={handleStatusCardClick}
                        />
                        <StatusCard 
                            status="cancelled" 
                            count={orderStats.cancelled_orders || 0}
                            onClick={handleStatusCardClick}
                        />
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className={styles.dashboardGrid}>
                    {/* Recent Orders */}
                    <RecentOrders 
                        orders={recentOrders} 
                        onOrderClick={handleOrderClick}
                    />

                    {/* Low Stock Alert */}
                    <LowStockAlert 
                        products={lowStockProducts}
                        onThresholdChange={handleLowStockThresholdChange}
                        onProductClick={handleProductClick}
                    />

                    {/* Top Products */}
                    <TopProducts 
                        products={topProducts}
                        onProductClick={handleProductClick}
                    />
                </div>

                {/* Quick Actions */}
                <div className={styles.quickActions}>
                    <h2>Quick Actions</h2>
                    <div className={styles.actionButtons}>
                        <button className={styles.actionButton} onClick={handleAddProduct}>
                            <span className={styles.actionIcon}>➕</span>
                            Add New Product
                        </button>
                        <button className={styles.actionButton} onClick={handleViewAllOrders}>
                            <span className={styles.actionIcon}>📋</span>
                            View All Orders
                        </button>
                        <button className={styles.actionButton} onClick={handleManageUsers}>
                            <span className={styles.actionIcon}>👥</span>
                            Manage Users
                        </button>
                        <button className={styles.actionButton} onClick={handleSettings}>
                            <span className={styles.actionIcon}>⚙️</span>
                            Settings
                        </button>
                        <button className={styles.actionButton} onClick={handleStockRefuel}>
                            <span className={styles.actionIcon}>📦</span>
                            Request Stock Refuel
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            {isOrderModalOpen && selectedOrder && (
                <div className={styles.orderModalOverlay} onClick={handleCloseOrderModal}>
                    <div className={styles.orderModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.orderModalHeader}>
                            <h2>Order Details - {selectedOrder.order_number}</h2>
                            <button 
                                onClick={handleCloseOrderModal}
                                className={styles.orderModalClose}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.orderModalContent}>
                            <OrderDetails 
                                order={selectedOrder} 
                                orderItems={orderItems}
                                user={null} // Admin view doesn't need user context
                                onImageClick={() => {}} // Disable image modal for admin view
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Product Details Modal */}
            {isProductModalOpen && selectedProduct && (
                <ProductDetailsModal 
                    product={selectedProduct}
                    onClose={handleCloseProductModal}
                />
            )}

            {/* Add Product Modal */}
            {isAddProductModalOpen && (
                <ProductModal 
                    onClose={handleCloseAddProductModal}
                    mode="add"
                />
            )}

            {/* Stock Refuel Modal */}
            <StockRefuelModal 
                isOpen={isStockRefuelModalOpen}
                onClose={handleCloseStockRefuelModal}
                onSuccess={handleStockRefuelSuccess}
            />
        </div>
    );
};

export default DashboardPage;
