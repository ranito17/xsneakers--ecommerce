import React from 'react';
import styles from './salesMetric.module.css';

const SalesMetrics = ({ metrics, isLoading = false }) => {
    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Helper function to format numbers
    const formatNumber = (number) => {
        if (!number && number !== 0) return '0';
        return new Intl.NumberFormat('en-US').format(number);
    };

    // Helper function to calculate percentage change
    const calculatePercentageChange = (current, previous) => {
        if (!previous || previous === 0) return 0;
        const currentNum = parseFloat(current) || 0;
        const previousNum = parseFloat(previous) || 0;
        if (previousNum === 0) return 0;
        return ((currentNum - previousNum) / previousNum) * 100;
    };

    // Helper function to get trend indicator
    const getTrendIndicator = (percentage) => {
        if (percentage > 0) return '↗';
        if (percentage < 0) return '↘';
        return '→';
    };

    // Helper function to get trend color
    const getTrendColor = (percentage) => {
        if (percentage > 0) return styles.positive;
        if (percentage < 0) return styles.negative;
        return styles.neutral;
    };

    const metricCards = [
        {
            title: 'Total Revenue',
            value: formatCurrency(metrics?.totalRevenue || 0),
            change: calculatePercentageChange(metrics?.totalRevenue || 0, metrics?.previousRevenue || 0),
            icon: '💰',
            color: '#10b981'
        },
        {
            title: 'Total Orders',
            value: formatNumber(metrics?.totalOrders || 0),
            change: calculatePercentageChange(metrics?.totalOrders || 0, metrics?.previousOrders || 0),
            icon: '📦',
            color: '#3b82f6'
        },
        {
            title: 'Average Order Value',
            value: formatCurrency(metrics?.averageOrderValue || 0),
            change: calculatePercentageChange(metrics?.averageOrderValue || 0, metrics?.previousAverageOrderValue || 0),
            icon: '📊',
            color: '#8b5cf6'
        },
        {
            title: 'Total Profit',
            value: formatCurrency(metrics?.totalProfit || 0),
            change: calculatePercentageChange(metrics?.totalProfit || 0, metrics?.previousProfit || 0),
            icon: '💎',
            color: '#f59e0b'
        },
        {
            title: 'New Customers',
            value: formatNumber(metrics?.newCustomers || 0),
            change: calculatePercentageChange(metrics?.newCustomers || 0, metrics?.previousNewCustomers || 0),
            icon: '👥',
            color: '#ef4444'
        },
        {
            title: 'Conversion Rate',
            value: `${Math.round((parseFloat(metrics?.conversionRate || 0) * 100 || 0) * 10) / 10}%`,
            change: calculatePercentageChange(metrics?.conversionRate || 0, metrics?.previousConversionRate || 0),
            icon: '🎯',
            color: '#06b6d4'
        }
    ];

    if (isLoading) {
        return (
            <div className={styles.metricsGrid}>
                {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div key={index} className={styles.metricCard}>
                        <div className={styles.skeleton}>
                            <div className={styles.skeletonIcon}></div>
                            <div className={styles.skeletonContent}>
                                <div className={styles.skeletonTitle}></div>
                                <div className={styles.skeletonValue}></div>
                                <div className={styles.skeletonChange}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={styles.metricsContainer}>
            <h2 className={styles.sectionTitle}>Sales Metrics</h2>
            <div className={styles.metricsGrid}>
                {metricCards.map((metric, index) => (
                    <div key={index} className={styles.metricCard}>
                        <div className={styles.metricIconContainer}>
                            <div 
                                className={styles.metricIcon}
                                style={{ backgroundColor: `${metric.color}15` }}
                            >
                                <span style={{ color: metric.color }}>{metric.icon}</span>
                            </div>
                        </div>
                        <div className={styles.metricContent}>
                            <h3 className={styles.metricTitle}>{metric.title}</h3>
                            <div className={styles.metricValue}>{metric.value}</div>
                            <div className={`${styles.metricChange} ${getTrendColor(metric.change)}`}>
                                <span className={styles.trendIcon}>
                                    {getTrendIndicator(metric.change)}
                                </span>
                                <span className={styles.changeValue}>
                                    {Math.round(Math.abs(parseFloat(metric.change) || 0) * 10) / 10}%
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SalesMetrics;
