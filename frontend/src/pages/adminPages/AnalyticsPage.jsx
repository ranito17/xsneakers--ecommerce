import React, { useState, useEffect } from 'react';
import DateRangePicker from '../../components/dateRangePicker/DateRangePicker';
import Calendar from '../../components/dateRangePicker/Calendar';
import SalesMetrics from '../../components/salesMetric/SalesMetrics';
import RevenueChart from '../../components/revenueChart/RevenueChart';
import ProductPerformance from '../../components/productPerformance/ProductPerformance';
import { analyticsApi } from '../../services';
import styles from './adminPages.module.css';

const AnalyticsPage = () => {
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null
    });
    const [analyticsData, setAnalyticsData] = useState({
        revenue: [],
        products: {},
        users: {},
        profit: [],
        orderStatus: [],
        geographic: []
    });
    const [metrics, setMetrics] = useState({
        totalRevenue: 0,
        previousRevenue: 0,
        totalOrders: 0,
        previousOrders: 0,
        averageOrderValue: 0,
        previousAverageOrderValue: 0,
        totalProfit: 0,
        previousProfit: 0,
        newCustomers: 0,
        previousNewCustomers: 0,
        conversionRate: 0,
        previousConversionRate: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [groupBy, setGroupBy] = useState('day');
    
    // Calendar modal state
    const [calendarConfig, setCalendarConfig] = useState(null);

    // Initialize default date range (last 30 days)
    useEffect(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        setDateRange({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });
    }, []);

    // Fetch analytics data when date range changes
    useEffect(() => {
        if (dateRange.startDate && dateRange.endDate) {
            fetchAnalyticsData();
        }
    }, [dateRange, groupBy]);

    const fetchAnalyticsData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch all analytics data
            const data = await analyticsApi.getAllAnalytics(
                dateRange.startDate,
                dateRange.endDate,
                groupBy
            );

            console.log('Analytics data received:', data); // Debug log

            setAnalyticsData(data);

            // Calculate metrics for the sales metrics component
            try {
                const calculatedMetrics = calculateMetrics(data);
                setMetrics(calculatedMetrics);
            } catch (calcError) {
                console.error('Error calculating metrics:', calcError);
                // Set default metrics if calculation fails
                setMetrics({
                    totalRevenue: 0,
                    previousRevenue: 0,
                    totalOrders: 0,
                    previousOrders: 0,
                    averageOrderValue: 0,
                    previousAverageOrderValue: 0,
                    totalProfit: 0,
                    previousProfit: 0,
                    newCustomers: 0,
                    previousNewCustomers: 0,
                    conversionRate: 0,
                    previousConversionRate: 0
                });
            }

        } catch (err) {
            console.error('Error fetching analytics data:', err);
            console.error('Error details:', {
                message: err.message,
                stack: err.stack,
                response: err.response?.data
            });
            setError('Failed to load analytics data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateMetrics = (data) => {
        const revenueData = Array.isArray(data.revenue) ? data.revenue : [];
        const profitData = Array.isArray(data.profit) ? data.profit : [];
        const userData = data.users || {};

        const totalRevenue = revenueData.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);
        const totalOrders = revenueData.reduce((sum, item) => sum + (parseInt(item.order_count) || 0), 0);
        const totalProfit = profitData.reduce((sum, item) => sum + (parseFloat(item.estimated_profit) || 0), 0);

        const userGrowth = Array.isArray(userData.userGrowth) ? userData.userGrowth : [];
        const newCustomers = userGrowth.reduce((sum, item) => sum + (parseInt(item.new_users) || 0), 0);

        let averageOrderValue = 0;
        if (revenueData.length > 0) {
            // Sum all avg_order_value and divide by number of data points (like RevenueChart)
            const totalAvgOrderValue = revenueData.reduce((sum, item) => sum + (parseFloat(item.avg_order_value) || 0), 0);
            averageOrderValue = totalAvgOrderValue / revenueData.length;
        } else {
            // Fallback to calculation if no data
            averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        }

        const conversionRate = 0.05; // This would come from actual data

        const previousRevenue = totalRevenue * 0.9;
        const previousOrders = totalOrders * 0.95;
        const previousAverageOrderValue = averageOrderValue * 0.98;
        const previousProfit = totalProfit * 0.92;
        const previousNewCustomers = newCustomers * 0.88;
        const previousConversionRate = conversionRate * 0.96;

        console.log('Calculated metrics:', {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            revenueDataLength: revenueData.length,
            sampleRevenueItem: revenueData[0],
            totalAvgOrderValue: revenueData.reduce((sum, item) => sum + (parseFloat(item.avg_order_value) || 0), 0)
        });

        return {
            totalRevenue,
            previousRevenue,
            totalOrders,
            previousOrders,
            averageOrderValue,
            previousAverageOrderValue,
            totalProfit,
            previousProfit,
            newCustomers,
            previousNewCustomers,
            conversionRate,
            previousConversionRate
        };
    };

    const handleDateRangeChange = (startDate, endDate) => {
        setDateRange({ startDate, endDate });
    };

    const handleGroupByChange = (newGroupBy) => {
        setGroupBy(newGroupBy);
    };

    const handleRefresh = () => {
        fetchAnalyticsData();
    };

    // Handle opening calendar modal
    const handleOpenCalendar = (type, config) => {
        setCalendarConfig({ type, ...config });
    };

    // Handle closing calendar modal
    const handleCloseCalendar = () => {
        setCalendarConfig(null);
    };

    if (error) {
        return (
            <div className={styles.analyticsPage}>
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h2 className={styles.errorTitle}>Error Loading Analytics</h2>
                    <p className={styles.errorMessage}>{error}</p>
                    <button 
                        onClick={handleRefresh}
                        className={styles.retryButton}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.analyticsPage}>
            <div className={styles.analyticsMainContent}>
                <div className={styles.pageHeader}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.pageTitle}>Analytics Dashboard</h1>
                        <p className={styles.pageSubtitle}>
                            Comprehensive insights into your business performance
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <DateRangePicker
                            onDateRangeChange={handleDateRangeChange}
                            initialStartDate={dateRange.startDate}
                            initialEndDate={dateRange.endDate}
                            onOpenCalendar={handleOpenCalendar}
                        />
                    </div>
                </div>

                <div className={styles.analyticsContent}>
                    {/* Sales Metrics */}
                    <div className={styles.metricsSection}>
                        <SalesMetrics 
                            metrics={metrics}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Charts Row */}
                    <div className={styles.chartsRow}>
                        <div className={styles.chartContainer}>
                            <RevenueChart
                                data={analyticsData.revenue}
                                isLoading={isLoading}
                                groupBy={groupBy}
                            />
                        </div>
                    </div>

                    {/* Product Performance */}
                    <div className={styles.productSection}>
                        <ProductPerformance
                            data={analyticsData.products}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Additional Analytics Sections */}
                    <div className={styles.additionalSections}>
                        <div className={styles.sectionPlaceholder}>
                            <h3>User Analytics</h3>
                            <p>User growth and customer segmentation data will be displayed here.</p>
                        </div>
                        
                        <div className={styles.sectionPlaceholder}>
                            <h3>Order Status Analytics</h3>
                            <p>Order status distribution and processing efficiency metrics will be shown here.</p>
                        </div>
                        
                        <div className={styles.sectionPlaceholder}>
                            <h3>Geographic Analytics</h3>
                            <p>Sales by location and regional performance insights will be displayed here.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Modal - Rendered at page level for better performance */}
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
    );
};

export default AnalyticsPage;
