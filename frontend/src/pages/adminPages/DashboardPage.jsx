import React, { useState, useEffect } from 'react';
import { productApi, orderApi, userApi } from '../../services/index';
import LoadingContainer from '../../components/loading/LoadingContainer';
import ErrorContainer from '../../components/error/ErrorContainer';
import styles from './adminPages.module.css';

const DashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        recentOrders: [],
        topProducts: [],
        orderStatuses: {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        },
        monthlyRevenue: [],
        lowStockProducts: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock data for dashboard
            const mockStats = {
                totalProducts: 156,
                totalOrders: 89,
                totalRevenue: 1245,
                totalUsers: 234,
                recentOrders: [
                    { id: 1001, total_amount: 299.99, status: 'delivered', created_at: '2024-01-15' },
                    { id: 1002, total_amount: 149.50, status: 'shipped', created_at: '2024-01-14' },
                    { id: 1003, total_amount: 89.99, status: 'processing', created_at: '2024-01-13' },
                    { id: 1004, total_amount: 199.99, status: 'pending', created_at: '2024-01-12' },
                    { id: 1005, total_amount: 399.99, status: 'delivered', created_at: '2024-01-11' }
                ],
                topProducts: [
                    { id: 1, name: 'Nike Air Max 270', price: 129.99, orderCount: 45 },
                    { id: 2, name: 'Adidas Ultraboost 21', price: 179.99, orderCount: 38 },
                    { id: 3, name: 'Jordan Air 1 Retro', price: 159.99, orderCount: 32 },
                    { id: 4, name: 'Converse Chuck Taylor', price: 59.99, orderCount: 28 },
                    { id: 5, name: 'New Balance 990v5', price: 189.99, orderCount: 25 }
                ],
                orderStatuses: {
                    pending: 12,
                    processing: 8,
                    shipped: 15,
                    delivered: 45,
                    cancelled: 9
                },
                lowStockProducts: [
                    { id: 10, name: 'Nike Zoom Fly', stock: 3 },
                    { id: 15, name: 'Adidas NMD R1', stock: 5 },
                    { id: 22, name: 'Puma RS-X', stock: 2 },
                    { id: 28, name: 'Reebok Classic', stock: 7 }
                ]
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStats(mockStats);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
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

    return (
        <div className={styles.dashboardPage}>
            <div className={styles.dashboardHeader}>
                <h1>Admin Dashboard</h1>
                <p>Welcome back! Here's an overview of your store.</p>
            </div>

            {/* Key Metrics Cards */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>📦</div>
                    <div className={styles.metricContent}>
                        <h3>{stats.totalProducts}</h3>
                        <p>Total Products</p>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>🛒</div>
                    <div className={styles.metricContent}>
                        <h3>{stats.totalOrders}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>💰</div>
                    <div className={styles.metricContent}>
                        <h3>${stats.totalRevenue.toFixed(2)}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>👥</div>
                    <div className={styles.metricContent}>
                        <h3>{stats.totalUsers}</h3>
                        <p>Total Users</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className={styles.dashboardGrid}>
                {/* Recent Orders */}
                <div className={styles.dashboardCard}>
                    <h2>Recent Orders</h2>
                    <div className={styles.recentOrders}>
                        {stats.recentOrders.length > 0 ? (
                            stats.recentOrders.map(order => (
                                <div key={order.id} className={styles.orderItem}>
                                    <div className={styles.orderInfo}>
                                        <span className={styles.orderId}>#{order.id}</span>
                                        <span className={styles.orderAmount}>${order.total_amount}</span>
                                    </div>
                                    <div className={styles.orderStatus}>
                                        <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No recent orders</p>
                        )}
                    </div>
                </div>

                {/* Order Status Overview */}
                <div className={styles.dashboardCard}>
                    <h2>Order Status</h2>
                    <div className={styles.statusGrid}>
                        <div className={styles.statusItem}>
                            <span className={styles.statusLabel}>Pending</span>
                            <span className={styles.statusCount}>{stats.orderStatuses.pending || 0}</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusLabel}>Processing</span>
                            <span className={styles.statusCount}>{stats.orderStatuses.processing || 0}</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusLabel}>Shipped</span>
                            <span className={styles.statusCount}>{stats.orderStatuses.shipped || 0}</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusLabel}>Delivered</span>
                            <span className={styles.statusCount}>{stats.orderStatuses.delivered || 0}</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusLabel}>Cancelled</span>
                            <span className={styles.statusCount}>{stats.orderStatuses.cancelled || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div className={styles.dashboardCard}>
                    <h2>Top Products</h2>
                    <div className={styles.topProducts}>
                        {stats.topProducts.length > 0 ? (
                            stats.topProducts.map(product => (
                                <div key={product.id} className={styles.productItem}>
                                    <div className={styles.productInfo}>
                                        <span className={styles.productName}>{product.name}</span>
                                        <span className={styles.productOrders}>{product.orderCount} orders</span>
                                    </div>
                                    <span className={styles.productPrice}>${product.price}</span>
                                </div>
                            ))
                        ) : (
                            <p>No products ordered yet</p>
                        )}
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className={styles.dashboardCard}>
                    <h2>Low Stock Alert</h2>
                    <div className={styles.lowStockList}>
                        {stats.lowStockProducts.length > 0 ? (
                            stats.lowStockProducts.map(product => (
                                <div key={product.id} className={styles.stockItem}>
                                    <span className={styles.productName}>{product.name}</span>
                                    <span className={styles.stockCount}>
                                        {product.stock} left
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p>All products have sufficient stock</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <h2>Quick Actions</h2>
                <div className={styles.actionButtons}>
                    <button className={styles.actionButton}>
                        <span className={styles.actionIcon}>➕</span>
                        Add New Product
                    </button>
                    <button className={styles.actionButton}>
                        <span className={styles.actionIcon}>📋</span>
                        View All Orders
                    </button>
                    <button className={styles.actionButton}>
                        <span className={styles.actionIcon}>👥</span>
                        Manage Users
                    </button>
                    <button className={styles.actionButton}>
                        <span className={styles.actionIcon}>⚙️</span>
                        Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
