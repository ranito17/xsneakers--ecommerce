// AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';

import { useSettings } from '../../context/SettingsProvider';
import { DateRangePicker, Calendar, SalesMetrics, RevenueChart, OrdersBarChart, PieChart } from '../../components/admin/analytics';
import SizeDistributionChart from '../../components/admin/analytics/charts/SizeDistributionChart';
import { analyticsApi, orderApi } from '../../services';
import { formatPrice } from '../../utils/price.utils';
import { getDefaultStartDate, getDefaultEndDate } from '../../utils/date.utils';
import ProtectedRoute from '../../components/ProtectedRoute';
import useAuthorization from '../../hooks/useAuthorization';
import { LoadingContainer, ErrorContainer } from '../../components/contactForm';
import styles from './adminPages.module.css';

const AnalyticsPage = () => {
    const { settings } = useSettings();
    const { isAuthorized, isLoading } = useAuthorization('admin');
    const currency = settings?.currency || 'ILS';
    const [activeTab, setActiveTab] = useState('finance');
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null
    });
    const [groupBy, setGroupBy] = useState('day');
    const [analyticsData, setAnalyticsData] = useState({
        revenue: null,
        products: { productPerformance: [], categoryPerformance: [] },
        users: null,
        userList: [],
        orders: null,
        cart: null
    });
    const [metrics, setMetrics] = useState({
        totalRevenue: 0,
        previousRevenue: 0,
        revenueChange: 0,
        totalOrders: 0,
        previousOrders: 0,
        ordersChange: 0,
        averageOrderValue: 0,
        previousAverageOrderValue: 0,
        averageOrderValueChange: 0,
        newUsers: 0,
        previousNewUsers: 0,
        usersChange: 0
    });
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDateRangeModal, setShowDateRangeModal] = useState(false);
    const [calendarConfig, setCalendarConfig] = useState(null);
    const [productsDisplayCount, setProductsDisplayCount] = useState(10);
    const [usersDisplayCount, setUsersDisplayCount] = useState(10);
    const [sizesDisplayCount, setSizesDisplayCount] = useState(5);
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [userFilter, setUserFilter] = useState('mostActive');
    
    useEffect(() => {
        setDateRange({
            startDate: getDefaultStartDate(30),
            endDate: getDefaultEndDate()
        });
    }, []);
    
    // fetchAnalyticsData - טוען נתוני אנליטיקס מהשרת לפי הטאב הפעיל
    // שליחה לשרת: getFinanceAnalytics(startDate, endDate, grouping), getOrderAnalytics(startDate, endDate), getUserAnalytics(startDate, endDate), getUserListAnalytics(startDate, endDate), getProductAnalytics(startDate, endDate)
    // תגובה מהשרת: { revenue: [], summary: {...} }, { sizeDistribution: [] }, { newUsers, activeUsers, returningUsers, userGrowth: [] }, [...], { productPerformance: [], categoryPerformance: [], metrics: {...} }
    const fetchAnalyticsData = async () => {
        setAnalyticsLoading(true);
        setError(null);
        try {
            let data = {};
            switch (activeTab) {
                case 'finance':
                    const daysDiff = Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24));
                    const useGrouping = (daysDiff > 30 && groupBy === '4weeks') ? '4weeks' : 'day';
                    const actualGrouping = (groupBy === 'week') ? 'week' : useGrouping;
                    const financeData = await analyticsApi.getFinanceAnalytics(
                        dateRange.startDate,
                        dateRange.endDate,
                        actualGrouping
                    );
                    const financeOrderData = await analyticsApi.getOrderAnalytics(
                dateRange.startDate,
                dateRange.endDate
            );
                    data = {
                        revenue: financeData.revenue || [],
                        summary: financeData.summary,
                        orders: financeOrderData.sizeDistribution ? { sizeDistribution: financeOrderData.sizeDistribution } : null
                    };
                    if (financeData.summary) {
                setMetrics({
                            totalRevenue: financeData.summary.totalRevenue || 0,
                    previousRevenue: 0,
                    revenueChange: 0,
                            totalOrders: financeData.summary.totalOrders || 0,
                    previousOrders: 0,
                    ordersChange: 0,
                            averageOrderValue: financeData.summary.averageOrderValue || 0,
                    previousAverageOrderValue: 0,
                    averageOrderValueChange: 0,
                    newUsers: 0,
                    previousNewUsers: 0,
                    usersChange: 0
                });
            }
                    break;
                case 'users':
                    const userData = await analyticsApi.getUserAnalytics(
                        dateRange.startDate,
                        dateRange.endDate
                    );
                    const userListData = await analyticsApi.getUserListAnalytics(
                        dateRange.startDate,
                        dateRange.endDate
                    );
                    data = { 
                        users: userData,
                        userList: userListData || []
                    };
                    break;
                case 'products':
                    const productData = await analyticsApi.getProductAnalytics(
                        dateRange.startDate,
                        dateRange.endDate
                    );
                    data = { products: productData };
                    break;
                case 'orders':
                    const orderDaysDiff = Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24));
                    const orderUseGrouping = (orderDaysDiff > 30 && groupBy === '4weeks') ? '4weeks' : 'day';
                    const orderData = await analyticsApi.getOrderAnalytics(
                        dateRange.startDate,
                        dateRange.endDate
                    );
                    const orderRevenueData = await analyticsApi.getFinanceAnalytics(
                        dateRange.startDate,
                        dateRange.endDate,
                        orderUseGrouping
                    );
                    data = {
                        orders: orderData.statusDistribution ? { statusDistribution: orderData.statusDistribution } : null,
                        revenue: orderRevenueData.revenue || []
                    };
                    break;
                default:
                    break;
            }
            setAnalyticsData(prev => ({
                ...prev,
                ...data
            }));
        } catch (err) {
            console.error('Error fetching analytics data:', err);
            setError(`Failed to load ${activeTab} analytics. Please try again.`);
        } finally {
            setAnalyticsLoading(false);
        }
    };
    
    useEffect(() => {
        if (dateRange.startDate && dateRange.endDate && !isLoading && isAuthorized) {
            fetchAnalyticsData();
        }
    }, [dateRange, activeTab, groupBy, isLoading, isAuthorized]);
    
    // If still loading auth, show loading
    if (isLoading) {
        return <LoadingContainer message="Loading..." size="large" />;
    }
    
    // If not authorized, don't execute any component logic
    if (!isAuthorized) {
        return <ProtectedRoute requiredRole="admin"><div /></ProtectedRoute>;
    }

    // handleDateRangeChange - מעדכן את טווח התאריכים
    const handleDateRangeChange = (startDate, endDate) => {
        setDateRange({ startDate, endDate });
    };


    // handleTabChange - מחליף טאב ומאפס את הפילטרים
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setProductsDisplayCount(10);
        setUsersDisplayCount(10);
        setSizesDisplayCount(5);
        setProductSearchQuery('');
        setUserFilter('mostActive');
    };


    // handleOpenDateRangeModal - פותח מודל בחירת טווח תאריכים
    const handleOpenDateRangeModal = () => {
        setShowDateRangeModal(true);
    };


    // handleCloseDateRangeModal - סוגר מודל בחירת טווח תאריכים
    const handleCloseDateRangeModal = () => {
        setShowDateRangeModal(false);
    };


    // handleOpenCalendar - פותח מודל לוח שנה
    const handleOpenCalendar = (type, config) => {
        setCalendarConfig({ type, ...config });
    };


    // handleCloseCalendar - סוגר מודל לוח שנה
    const handleCloseCalendar = () => {
        setCalendarConfig(null);
    };


    const renderTabContent = () => {
        switch (activeTab) {
            case 'finance':
                return (
                    <>
                        <div className={styles.metricsSection}>
                            <SalesMetrics 
                                metrics={metrics}
                                isLoading={analyticsLoading}
                                showTitle={false}
                            />
                        </div>
                        <div className={styles.chartGrid}>
                            <div className={styles.chartGridFull}>
                                <RevenueChart
                                    data={analyticsData.revenue || []}
                                    isLoading={analyticsLoading}
                                    dateRange={dateRange}
                                    groupBy={groupBy}
                                    onGroupByChange={setGroupBy}
                                />
                            </div>
                            <div className={styles.chartGridHalf}>
                                <OrdersBarChart
                                    data={analyticsData.revenue || []}
                                    isLoading={analyticsLoading}
                                    dateRange={dateRange}
                                    groupBy={groupBy}
                                    onGroupByChange={setGroupBy}
                                />
                            </div>
                        </div>
                        <div className={styles.chartGrid}>
                            <div className={styles.chartGridFull}>
                                <SizeDistributionChart
                                    data={analyticsData.orders?.sizeDistribution || []}
                                    isLoading={analyticsLoading}
                                    title="Orders by Size"
                                />
                            </div>
                        </div>
                        <div className={styles.productTableSection}>
                            <h3 className={styles.sectionTitle}>Size Performance Details</h3>
                            <div className={styles.productTable}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Size</th>
                                            <th>Quantity Sold</th>
                                            <th>Revenue</th>
                                            <th>Orders</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analyticsData.orders?.sizeDistribution && analyticsData.orders.sizeDistribution.length > 0 ? (
                                            analyticsData.orders.sizeDistribution.slice(0, sizesDisplayCount).map((sizeItem, index) => (
                                                <tr key={index}>
                                                    <td>Size {sizeItem.size}</td>
                                                    <td>{sizeItem.total_quantity_sold}</td>
                                                    <td>{formatPrice(sizeItem.total_revenue, currency)}</td>
                                                    <td>{sizeItem.order_count}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                                    No shoes or products sold yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {analyticsData.orders?.sizeDistribution && analyticsData.orders.sizeDistribution.length > sizesDisplayCount && (
                                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                    <button
                                        onClick={() => setSizesDisplayCount(prev => prev + 5)}
                                        className={styles.loadMoreButton}
                                    >
                                        Show 5 More
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                );
            case 'users':
                const usersList = analyticsData.userList || [];
                let filteredAndSortedUsers = [...usersList];
                switch (userFilter) {
                    case 'mostActive':
                        filteredAndSortedUsers.sort((a, b) => b.orders - a.orders);
                        break;
                    case 'mostInactive':
                        filteredAndSortedUsers.sort((a, b) => a.orders - b.orders);
                        break;
                    case 'oldest':
                        filteredAndSortedUsers.sort((a, b) => new Date(a.joinedDate) - new Date(b.joinedDate));
                        break;
                    case 'newest':
                        filteredAndSortedUsers.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
                        break;
                    default:
                        filteredAndSortedUsers.sort((a, b) => b.orders - a.orders);
                }
                const displayedUsers = filteredAndSortedUsers.slice(0, usersDisplayCount);
                return (
                    <>
                        <div className={styles.metricsSection}>
                            <div className={styles.metricsGrid}>
                                <div className={styles.metricCard}>
                                    <h3 className={styles.metricTitle}>NEW USERS</h3>
                                    <div className={styles.metricValue}>{analyticsData.users?.newUsers || 156}</div>
                                    <p className={styles.metricDescription}>Users who joined in the period</p>
                                </div>
                                <div className={styles.metricCard}>
                                    <h3 className={styles.metricTitle}>ACTIVE USERS</h3>
                                    <div className={styles.metricValue}>{analyticsData.users?.activeUsers || 1243}</div>
                                    <p className={styles.metricDescription}>Users who made purchases</p>
                                </div>
                                <div className={styles.metricCard}>
                                    <h3 className={styles.metricTitle}>RETURNING USERS</h3>
                                    <div className={styles.metricValue}>{analyticsData.users?.returningUsers || 892}</div>
                                    <p className={styles.metricDescription}>Users with multiple orders</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.chartGrid}>
                            <div className={styles.chartGridFull}>
                                <RevenueChart
                                    data={analyticsData.users?.userGrowth?.map(item => ({
                                        period: item.date,
                                        revenue: item.count,
                                        order_count: item.count
                                    })) || []}
                                    isLoading={analyticsLoading}
                                    dateRange={dateRange}
                                    title="Users Who Joined (Account Creation)"
                                    label="New Users"
                                    yAxisLabel="Users"
                                    isCurrency={false}
                                    groupBy={groupBy}
                                    onGroupByChange={setGroupBy}
                                />
                            </div>
                        </div>
                        <div className={styles.productTableSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 className={styles.sectionTitle}>Users</h3>
                                <select
                                    value={userFilter}
                                    onChange={(e) => {
                                        setUserFilter(e.target.value);
                                        setUsersDisplayCount(10);
                                    }}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        border: '2px solid #e2e8f0',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                >
                                    <option value="mostActive">Most Active</option>
                                    <option value="mostInactive">Most Inactive</option>
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                </select>
                            </div>
                            <div className={styles.productTable}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Orders</th>
                                            <th>Total Spent</th>
                                            <th>Joined Date</th>
                                            <th>Last Order</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAndSortedUsers.length > 0 ? (
                                            displayedUsers.map((user) => (
                                                <tr key={user.id}>
                                                    <td>{user.name || 'N/A'}</td>
                                                    <td>{user.email || 'N/A'}</td>
                                                    <td>{parseInt(user.orders) || 0}</td>
                                                    <td>{formatPrice(parseFloat(user.totalSpent) || 0, currency)}</td>
                                                    <td>{user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'N/A'}</td>
                                                    <td>{user.lastOrder ? new Date(user.lastOrder).toLocaleDateString() : 'No orders'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                                    No active users with orders in this period
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {filteredAndSortedUsers.length > usersDisplayCount && (
                                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                    <button
                                        onClick={() => setUsersDisplayCount(prev => prev + 10)}
                                        className={styles.loadMoreButton}
                                    >
                                        Show 10 More
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                );
            case 'products':
                const allProducts = (analyticsData.products?.productPerformance || [])
                    .filter(product => (parseFloat(product.total_revenue) || 0) > 0);
                const filteredProducts = allProducts.filter(product =>
                    product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
                );
                const displayedProducts = filteredProducts.slice(0, productsDisplayCount);
                const productMetrics = analyticsData.products?.metrics || {};
                return (
                    <>
                        <div className={styles.metricsSection}>
                            <div className={styles.metricsGrid}>
                                <div className={styles.metricCard}>
                                    <h3 className={styles.metricTitle}>MOST SOLD PRODUCT</h3>
                                    <div className={styles.metricValue}>
                                        {productMetrics.mostSoldProduct?.name || 'N/A'}
                                    </div>
                                    <p className={styles.metricDescription}>
                                        {productMetrics.mostSoldProduct 
                                            ? `${productMetrics.mostSoldProduct.total_quantity_sold || 0} units sold`
                                            : 'No sales data available'}
                                    </p>
                                </div>
                                <div className={styles.metricCard}>
                                    <h3 className={styles.metricTitle}>MOST SOLD SIZE</h3>
                                    <div className={styles.metricValue}>
                                        {productMetrics.mostSoldSize?.size || 'N/A'}
                                    </div>
                                    <p className={styles.metricDescription}>
                                        {productMetrics.mostSoldSize 
                                            ? `${productMetrics.mostSoldSize.total_quantity_sold || 0} units sold`
                                            : 'No size data available'}
                                    </p>
                                </div>
                                <div className={styles.metricCard}>
                                    <h3 className={styles.metricTitle}>BEST CATEGORY</h3>
                                    <div className={styles.metricValue}>
                                        {productMetrics.bestCategory?.category_name || 'N/A'}
                                    </div>
                                    <p className={styles.metricDescription}>
                                        {productMetrics.bestCategory 
                                            ? `${formatPrice(productMetrics.bestCategory.total_revenue || 0, currency)} revenue`
                                            : 'No category data available'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.chartGrid}>
                            <div className={styles.chartGridHalf}>
                                <PieChart
                                    data={(analyticsData.products?.categoryPerformance || []).map((cat, index) => ({
                                        label: cat.category_name,
                                        value: Math.round((cat.total_revenue / 1000)),
                                        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
                                    }))}
                                    isLoading={analyticsLoading}
                                    title="Revenue by Category"
                                    chartType="doughnut"
                                />
                            </div>
                        </div>
                        <div className={styles.productTableSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 className={styles.sectionTitle}>Product Performance</h3>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={productSearchQuery}
                                    onChange={(e) => {
                                        setProductSearchQuery(e.target.value);
                                        setProductsDisplayCount(10);
                                    }}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        border: '2px solid #e2e8f0',
                                        fontSize: '0.9rem',
                                        width: '300px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                            <div className={styles.productTable}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Revenue</th>
                                            <th>Sales</th>
                                            <th>Avg Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedProducts.length > 0 ? (
                                            displayedProducts.map((product) => {
                                                const totalRevenue = parseFloat(product.total_revenue) || 0;
                                                const price = parseFloat(product.price) || 0;
                                                return (
                                                    <tr key={product.id}>
                                                        <td>{product.name}</td>
                                                        <td>{formatPrice(totalRevenue, currency)}</td>
                                                        <td>{product.total_quantity_sold || 0}</td>
                                                        <td>{formatPrice(price, currency)}</td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                                    No shoes or products sold yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {filteredProducts.length > productsDisplayCount && (
                                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                    <button
                                        onClick={() => setProductsDisplayCount(prev => prev + 10)}
                                        className={styles.loadMoreButton}
                                    >
                                        Show 10 More
                                    </button>
                                </div>
                            )}
                            {filteredProducts.length === 0 && productSearchQuery && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    No products found matching "{productSearchQuery}"
                                </div>
                            )}
                            {filteredProducts.length > 0 && (
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    marginTop: '24px', 
                                    padding: '20px',
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                                }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Total Products</div>
                                        <div style={{ color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
                                            {filteredProducts.length}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Total Revenue</div>
                                        <div style={{ color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
                                            {formatPrice(filteredProducts.reduce((sum, p) => sum + (parseFloat(p.total_revenue) || 0), 0), currency)}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Total Sales</div>
                                        <div style={{ color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
                                            {filteredProducts.reduce((sum, p) => sum + (parseInt(p.total_quantity_sold) || 0), 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Avg Price</div>
                                        <div style={{ color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
                                            {formatPrice(
                                                filteredProducts.length > 0 
                                                    ? filteredProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / filteredProducts.length 
                                                    : 0,
                                                currency
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                );
            default:
                return null;
        }
    };
    if (error) {
        return (
            <ProtectedRoute requiredRole="admin">
                <ErrorContainer message={error} onRetry={fetchAnalyticsData} />
            </ProtectedRoute>
        );
    }
    const tabs = [
        { id: 'finance', label: 'Finance & Orders' },
        { id: 'users', label: 'Users' },
        { id: 'products', label: 'Products' }
    ];
    return (
        <ProtectedRoute requiredRole="admin">
            <div className={styles.analyticsPage}>
            <div className={styles.analyticsMainContent}>
                <div className={styles.analyticsContent}>
                    <div className={styles.tabNavigation} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
                                onClick={() => handleTabChange(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                        {dateRange.startDate && dateRange.endDate && (
                            <div style={{
                                marginLeft: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.875rem',
                                color: '#374151',
                                fontWeight: '500'
                            }}>
                                <span>
                                    {new Date(dateRange.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(dateRange.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={handleOpenDateRangeModal}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: '2px solid #e2e8f0',
                                backgroundColor: 'white',
                                color: '#374151',
                                fontSize: '1.25rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                                e.target.style.backgroundColor = '#f8fafc';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.backgroundColor = 'white';
                            }}
                            title="Select Date Range"
                        >
                            📅
                        </button>
                    </div>
                    {renderTabContent()}
                </div>
                     </div>
            {showDateRangeModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
                onClick={handleCloseDateRangeModal}
                >
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a' }}>Select Date Range</h2>
                            <button
                                onClick={handleCloseDateRangeModal}
                                style={{
                                    padding: '0.25rem',
                                    borderRadius: '50%',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#6b7280',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: '1'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                ×
                            </button>
                         </div>
                        <DateRangePicker
                            onDateRangeChange={(startDate, endDate) => {
                                handleDateRangeChange(startDate, endDate);
                                handleCloseDateRangeModal();
                            }}
                            initialStartDate={dateRange.startDate}
                            initialEndDate={dateRange.endDate}
                            onOpenCalendar={handleOpenCalendar}
                        />
                     </div>
                </div>
            )}
            {calendarConfig && (
                <Calendar
                    selectedDate={calendarConfig.selectedDate}
                    onDateSelect={calendarConfig.onDateSelect}
                    onClose={handleCloseCalendar}
                    minDate={calendarConfig.minDate}
                    maxDate={calendarConfig.maxDate}
                />
            )}
            </div>
        </ProtectedRoute>
    );
};

export default AnalyticsPage;
