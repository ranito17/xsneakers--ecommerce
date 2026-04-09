import React from 'react';
import { useSettings } from '../../../../context/SettingsProvider';
import { formatPrice } from '../../../../utils/price.utils';
import styles from './salesMetric.module.css';

/**
 * SalesMetrics Component
 * 
 * Displays key sales performance metrics including:
 * - Total Revenue
 * - Total Orders  
 * - Average Order Value
 * 
 * Features:
 * - Currency formatting with 2 decimal places
 * - Percentage change calculations
 * - Trend indicators (up/down arrows)
 * - Loading skeleton states
 * - Responsive grid layout
 * - Modern, clean design without icons
 */
const SalesMetrics = ({ metrics, isLoading = false, showTitle = true }) => {
    const { settings } = useSettings();
    const currency = settings?.currency || 'ILS';
    
    /**
     * Format currency values with 2 decimal places
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    const formatCurrency = (amount) => {
        return formatPrice(amount, currency);
    };

    /**
     * Format numbers with comma separators
     * @param {number} number - Number to format
     * @returns {string} Formatted number string
     */
    const formatNumber = (number) => {
        if (!number && number !== 0) return '0';
        return new Intl.NumberFormat('en-US').format(number);
    };

    /**
     * Calculate percentage change between current and previous values
     * @param {number} current - Current period value
     * @param {number} previous - Previous period value
     * @returns {number} Percentage change
     */
    const calculatePercentageChange = (current, previous) => {
        if (!previous || previous === 0) return 0;
        const currentNum = parseFloat(current) || 0;
        const previousNum = parseFloat(previous) || 0;
        if (previousNum === 0) return 0;
        return ((currentNum - previousNum) / previousNum) * 100;
    };

    /**
     * Get trend indicator arrow based on percentage change
     * @param {number} percentage - Percentage change value
     * @returns {string} Trend arrow symbol
     */
    const getTrendIndicator = (percentage) => {
        if (percentage > 0) return '↗';
        if (percentage < 0) return '↘';
        return '→';
    };

    /**
     * Get CSS class for trend color based on percentage change
     * @param {number} percentage - Percentage change value
     * @returns {string} CSS class name
     */
    const getTrendColor = (percentage) => {
        if (percentage > 0) return styles.positive;
        if (percentage < 0) return styles.negative;
        return styles.neutral;
    };

    // Define the metrics to display with safe defaults
    const metricCards = [
        {
            title: 'TOTAL REVENUE',
            value: formatCurrency(metrics?.totalRevenue || 0),
            description: 'Total sales revenue for the selected period'
        },
        {
            title: 'TOTAL ORDERS',
            value: (metrics?.totalOrders || 0).toString(),
            description: 'Number of orders placed in the period'
        },
        {
            title: 'AVERAGE ORDER VALUE',
            value: formatCurrency(metrics?.averageOrderValue || 0),
            description: 'Average amount spent per order'
        },
        {
            title: 'NEW USERS',
            value: (metrics?.newUsers || 0).toString(),
            description: 'Number of users who joined in the period'
        }
    ];

    /**
     * Render skeleton loading cards
     * @returns {Array} Array of skeleton card elements
     */
    const renderSkeletonCards = () => {
        return Array(4).fill(null).map((_, index) => (
            <div key={index} className={styles.skeleton}>
                <div className={styles.skeletonContent}>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonValue}></div>
                    <div className={styles.skeletonDescription}></div>
                    <div className={styles.skeletonChange}></div>
                </div>
            </div>
        ));
    };

    // Loading skeleton state
    if (isLoading) {
        return (
            <div className={styles.metricsGrid}>
                {renderSkeletonCards()}
            </div>
        );
    }

    return (
        <div className={styles.metricsContainer}>
            {showTitle && <h2 className={styles.sectionTitle}>Sales Metrics</h2>}
            <div className={styles.metricsGrid}>
                {metricCards.map((metric, index) => (
                    <div key={index} className={styles.metricCard}>
                        <div className={styles.metricContent}>
                            <h3 className={styles.metricTitle}>{metric.title}</h3>
                            <div className={styles.metricValue}>{metric.value}</div>
                            <p className={styles.metricDescription}>{metric.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SalesMetrics;
