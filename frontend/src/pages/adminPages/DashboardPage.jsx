// DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuthentication';
import { useNavigate } from 'react-router-dom';
import { orderApi, productApi } from '../../services/index';
import { LoadingContainer, ErrorContainer } from '../../components/contactForm';
import { RecentOrders, LowStockAlert, TopProducts, StockRefuelModal } from '../../components/admin/dashboard';
import ProtectedRoute from '../../components/ProtectedRoute';
import useAuthorization from '../../hooks/useAuthorization';

import { ProductSizesModal, ProductImagesModal, AdminProductModal } from '../../components/admin/products';
import { AdminOrderModal } from '../../components/admin/orders';
import { useToast } from '../../components/common/toast';
import styles from './adminPages.module.css';
import { useSettings } from '../../context/SettingsProvider';

const DashboardPage = () => {
    const { isAuthenticated, user } = useAuth();
    const { settings, updateSettings } = useSettings();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductLowStockSizes, setSelectedProductLowStockSizes] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isStockRefuelModalOpen, setIsStockRefuelModalOpen] = useState(false);
    const [showSizesModal, setShowSizesModal] = useState(false);
    const [showImagesModal, setShowImagesModal] = useState(false);
    const [topProductsTimeFilter, setTopProductsTimeFilter] = useState('all');
    const [topProductsSortOrder, setTopProductsSortOrder] = useState('best');
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
        lowStockProducts: []
    });

    const { isAuthorized, isLoading } = useAuthorization('admin');

    const lowStockThreshold = settings?.low_stock_threshold || 10;
    const lowStockThresholdPerSize = settings?.low_stock_threshold_per_size || 5;

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [ordersResponse, topProductsResponse, lowStockResponse] = await Promise.all([
                orderApi.getAllOrders(),
                productApi.getTopProducts(),
                productApi.getLowStockProducts(lowStockThreshold)
            ]);

            if (ordersResponse.success && ordersResponse.data) {
                const allOrders = ordersResponse.data;

                const orderStats = {
                    total_orders: allOrders.length,
                    total_revenue: allOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0),
                    pending_orders: allOrders.filter((o) => o.status === 'pending').length,
                    processing_orders: allOrders.filter((o) => o.status === 'processing').length,
                    shipped_orders: allOrders.filter((o) => o.status === 'shipped').length,
                    delivered_orders: allOrders.filter((o) => o.status === 'delivered').length,
                    cancelled_orders: allOrders.filter((o) => o.status === 'cancelled').length
                };

                const recentOrders = [...allOrders]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 8);

                setDashboardData((prev) => ({
                    ...prev,
                    orderStats,
                    recentOrders
                }));
            }

            if (topProductsResponse.success && topProductsResponse.data) {
                setDashboardData((prev) => ({
                    ...prev,
                    topProducts: topProductsResponse.data
                }));
            }

            if (lowStockResponse.success) {
                setDashboardData((prev) => ({
                    ...prev,
                    lowStockProducts: lowStockResponse.data
                }));
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [lowStockThreshold]);

    const getFilteredAndSortedTopProducts = useCallback(() => {
        let filtered = [...(dashboardData.topProducts || [])];

        if (topProductsTimeFilter !== 'all') {
            const now = new Date();
            const startDate = new Date();

            switch (topProductsTimeFilter) {
                case '7d':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(startDate.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(startDate.getDate() - 90);
                    break;
                case '1y':
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
                default:
                    break;
            }

            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);

            filtered = filtered.filter((product) => {
                const orderDates = product.order_dates || [];
                if (orderDates.length === 0) return false;

                return orderDates.some((dateStr) => {
                    if (!dateStr) return false;
                    try {
                        const orderDate = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
                        if (Number.isNaN(orderDate.getTime())) return false;
                        orderDate.setHours(0, 0, 0, 0);
                        return orderDate >= startDate && orderDate <= endDate;
                    } catch {
                        return false;
                    }
                });
            });
        }

        filtered.sort((a, b) => {
            const quantityA = parseFloat(a.total_quantity_sold) || 0;
            const quantityB = parseFloat(b.total_quantity_sold) || 0;

            if (topProductsSortOrder === 'worst') {
                return quantityA - quantityB;
            }

            return quantityB - quantityA;
        });

        return filtered;
    }, [dashboardData.topProducts, topProductsTimeFilter, topProductsSortOrder]);

    const handleTopProductsTimeFilterChange = useCallback((timeFilter) => {
        setTopProductsTimeFilter(timeFilter);
    }, []);

    const handleTopProductsSortChange = useCallback((sortOrder) => {
        setTopProductsSortOrder(sortOrder);
    }, []);

    const handleOrderFiltersChange = useCallback(async (filters) => {
        if (!filters) return;

        try {
            const response = await orderApi.getAllOrders();
            if (!response.success || !response.data) return;

            let filtered = [...response.data];

            if (filters.status && filters.status !== 'all') {
                filtered = filtered.filter((order) => order.status === filters.status);
            }

            if (filters.dateRange && filters.dateRange !== 'all') {
                const now = new Date();
                let dateFrom;

                switch (filters.dateRange) {
                    case 'today':
                        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    case 'week':
                        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    default:
                        dateFrom = null;
                }

                if (dateFrom) {
                    filtered = filtered.filter((order) => {
                        const orderDate = new Date(order.created_at);
                        return orderDate >= dateFrom;
                    });
                }
            }

            const sortOrder = filters.sortOrder === 'earliest' ? 1 : -1;
            filtered.sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return (dateA - dateB) * sortOrder;
            });

            const recentOrders = filtered.slice(0, 8);

            setDashboardData((prev) => ({
                ...prev,
                recentOrders
            }));
        } catch (err) {
            console.error('Error filtering orders:', err);
        }
    }, []);

    const handleLowStockViewModeChange = useCallback(async (viewMode) => {
        try {
            if (viewMode === 'bySize') {
                const response = await productApi.getProductsWithLowStockSizes(lowStockThresholdPerSize);
                if (response.success) {
                    setDashboardData((prev) => ({
                        ...prev,
                        lowStockProducts: response.data
                    }));
                }
            } else {
                const response = await productApi.getLowStockProducts(lowStockThreshold);
                if (response.success) {
                    setDashboardData((prev) => ({
                        ...prev,
                        lowStockProducts: response.data
                    }));
                }
            }
        } catch (err) {
            console.error('Error fetching low stock products:', err);
        }
    }, [lowStockThreshold, lowStockThresholdPerSize]);

    const handleLowStockThresholdChange = async (threshold) => {
        try {
            const response = await updateSettings({
                ...settings,
                low_stock_threshold: threshold
            });

            if (response.success) {
                fetchDashboardData();
            } else {
                console.error('Failed to update threshold:', response.message);
            }
        } catch (err) {
            console.error('Error updating low stock threshold:', err);
        }
    };

    const handleOrderClick = useCallback(async (order) => {
        try {
            const orderDetails = await orderApi.getOrderById(order.order_id);
            const orderItemsData = await orderApi.getOrderItems(order.order_id);

            if (orderDetails.success && orderDetails.data) {
                setSelectedOrder(orderDetails.data);
            } else {
                setSelectedOrder(order);
            }

            if (orderItemsData.success && orderItemsData.data) {
                setOrderItems(orderItemsData.data);
            } else {
                setOrderItems([]);
            }

            setIsOrderModalOpen(true);
        } catch (err) {
            console.error('Error fetching order details:', err);
            setSelectedOrder(order);
            setOrderItems([]);
            setIsOrderModalOpen(true);
        }
    }, []);

    const handleCloseOrderModal = () => {
        setIsOrderModalOpen(false);
        setSelectedOrder(null);
        setOrderItems([]);
    };

    const handleProductClick = async (product) => {
        try {
            const lowStockSizes =
                product.low_stock_sizes &&
                Array.isArray(product.low_stock_sizes) &&
                product.low_stock_sizes.length > 0
                    ? product.low_stock_sizes
                    : null;

            const productDetails = await productApi.getProductById(product.id);
            const productToShow =
                productDetails.success && productDetails.data
                    ? productDetails.data
                    : product;

            setSelectedProductLowStockSizes(lowStockSizes);
            setSelectedProduct(productToShow);
            setIsProductModalOpen(true);
        } catch (err) {
            console.error('Error fetching product details:', err);
            const lowStockSizes =
                product.low_stock_sizes &&
                Array.isArray(product.low_stock_sizes) &&
                product.low_stock_sizes.length > 0
                    ? product.low_stock_sizes
                    : null;

            setSelectedProductLowStockSizes(lowStockSizes);
            setSelectedProduct(product);
            setIsProductModalOpen(true);
        }
    };

    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
        setSelectedProduct(null);
        setSelectedProductLowStockSizes(null);
        setShowSizesModal(false);
        setShowImagesModal(false);
    };

    const handleOpenSizesModal = (product) => {
        const productToShow = { ...product };

        const lowStockSizes =
            selectedProductLowStockSizes ||
            (product.low_stock_sizes &&
            Array.isArray(product.low_stock_sizes) &&
            product.low_stock_sizes.length > 0
                ? product.low_stock_sizes
                : null);

        if (lowStockSizes && lowStockSizes.length > 0) {
            productToShow.sizes = lowStockSizes.map((ls) => ({
                size: ls.size,
                quantity: parseInt(ls.quantity, 10) || 0
            }));
        } else if (product.sizes) {
            productToShow.sizes = product.sizes;
        }

        setSelectedProduct(productToShow);
        setShowSizesModal(true);
    };

    const handleOpenImagesModal = (product) => {
        setSelectedProduct(product);
        setShowImagesModal(true);
    };

    const handleSaveSizes = async (productId, sizes) => {
        try {
            const sizesArray = Array.isArray(sizes)
                ? sizes
                : typeof sizes === 'string'
                    ? JSON.parse(sizes)
                    : [];

            const response = await productApi.updateProductSizes(productId, sizesArray);

            if (response.success) {
                await fetchDashboardData();
                setShowSizesModal(false);
                setSelectedProduct(null);
                showSuccess('Product sizes updated successfully!');
            } else {
                showError(response.message || 'Failed to update product sizes');
            }
        } catch (err) {
            console.error('Error updating sizes:', err);
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                'Failed to update product sizes. Please try again.';
            showError(errorMessage);
        }
    };

    const handleStockRefuel = () => {
        setIsStockRefuelModalOpen(true);
    };

    const handleCloseStockRefuelModal = () => {
        setIsStockRefuelModalOpen(false);
    };

    const handleStockRefuelSuccess = () => {
        fetchDashboardData();
    };

    const handleViewAllOrders = () => {
        navigate('/admin/orders');
    };

    const handleSettings = () => {
        navigate('/admin/settings');
    };

    // Prevent build error if AdminOrderModal expects these props
    const handleImageClick = useCallback(() => {}, []);
    const handleContactSubmit = useCallback(() => {}, []);

    useEffect(() => {
        if (isAuthenticated && user && settings) {
            fetchDashboardData();
        }
    }, [isAuthenticated, user, settings, fetchDashboardData]);

    if (isLoading) {
        return <LoadingContainer message="Loading..." size="large" />;
    }

    if (!isAuthorized) {
        return (
            <ProtectedRoute requiredRole="admin">
                <div />
            </ProtectedRoute>
        );
    }

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

    const { recentOrders, lowStockProducts } = dashboardData;
    const filteredTopProducts = getFilteredAndSortedTopProducts();

    return (
        <div className={styles.dashboardPage}>
            <div className={styles.dashboardMainContent}>
                <div className={styles.quickActionsBar}>
                    <h2>Quick Actions</h2>
                    <div className={styles.actionButtonsCompact}>
                        <button className={styles.actionBtnCompact} onClick={handleViewAllOrders}>
                            <span>📋</span> View Orders
                        </button>
                        <button className={styles.actionBtnCompact} onClick={() => navigate('/admin/products')}>
                            <span>📦</span> All Products
                        </button>
                        <button className={styles.actionBtnCompact} onClick={handleStockRefuel}>
                            <span>📬</span> Refuel Stock
                        </button>
                        <button className={styles.actionBtnCompact} onClick={handleSettings}>
                            <span>⚙️</span> Settings
                        </button>
                    </div>
                </div>

                <div className={styles.dashboardSections}>
                    <div className={styles.dashboardSection}>
                        <RecentOrders
                            orders={recentOrders}
                            onOrderClick={handleOrderClick}
                            onFiltersChange={handleOrderFiltersChange}
                        />
                    </div>

                    <div className={styles.dashboardSection}>
                        <TopProducts
                            products={filteredTopProducts}
                            onProductClick={handleProductClick}
                            timeFilter={topProductsTimeFilter}
                            sortOrder={topProductsSortOrder}
                            onTimeFilterChange={handleTopProductsTimeFilterChange}
                            onSortChange={handleTopProductsSortChange}
                        />
                    </div>

                    <div className={styles.dashboardSection}>
                        <LowStockAlert
                            products={lowStockProducts}
                            onThresholdChange={handleLowStockThresholdChange}
                            onProductClick={handleProductClick}
                            onViewModeChange={handleLowStockViewModeChange}
                        />
                    </div>
                </div>
            </div>

            <StockRefuelModal
                isOpen={isStockRefuelModalOpen}
                onClose={handleCloseStockRefuelModal}
                onSuccess={handleStockRefuelSuccess}
            />

            {isOrderModalOpen && selectedOrder && (
                <AdminOrderModal
                    order={selectedOrder}
                    orderItems={orderItems}
                    onClose={handleCloseOrderModal}
                    onImageClick={handleImageClick}
                    onContactSubmit={handleContactSubmit}
                />
            )}

            {isProductModalOpen && selectedProduct && (
                <AdminProductModal
                    product={selectedProduct}
                    categories={[]}
                    onClose={handleCloseProductModal}
                    onSave={() => {}}
                    viewMode
                    onOpenSizesModal={handleOpenSizesModal}
                    onOpenImagesModal={handleOpenImagesModal}
                    isNewProduct={false}
                    currency={settings?.currency || 'ILS'}
                    taxRate={settings?.tax_rate || 0}
                    defaultDeliveryCost={settings?.default_delivery_cost || 0}
                    freeDeliveryThreshold={settings?.free_delivery_threshold || 0}
                />
            )}

            {showSizesModal && selectedProduct && (
                <ProductSizesModal
                    product={selectedProduct}
                    onClose={() => setShowSizesModal(false)}
                    onSave={handleSaveSizes}
                    mode="view"
                />
            )}

            {showImagesModal && selectedProduct && (
                <ProductImagesModal
                    product={selectedProduct}
                    onClose={() => setShowImagesModal(false)}
                    onUpload={async () => {}}
                    onDelete={async () => {}}
                    viewMode
                />
            )}
        </div>
    );
};

export default DashboardPage;