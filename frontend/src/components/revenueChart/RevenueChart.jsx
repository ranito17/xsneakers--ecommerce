import React, { useState, useMemo } from 'react';
import styles from './revenueChart.module.css';

const RevenueChart = ({ data = [], isLoading = false, groupBy = 'day' }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    console.log('RevenueChart data:', data);
    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Helper function to format date
    const formatDate = (dateString, groupBy) => {
        const date = new Date(dateString);
        switch (groupBy) {
            case 'day':
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            case 'week':
                return `Week ${date.getWeek()}`;
            case 'month':
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            case 'year':
                return date.getFullYear().toString();
            default:
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    // Calculate chart dimensions and data
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return { points: [], maxValue: 0, minValue: 0 };

        const points = data.map((item, index) => ({
            x: index,
            y: parseFloat(item.revenue) || 0,
            date: item.period,
            orders: parseInt(item.order_count) || 0,
            avgOrderValue: parseFloat(item.avg_order_value) || 0
        }));

        const values = points.map(p => p.y);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);

        return { points, maxValue, minValue };
    }, [data]);

    // Calculate SVG path for the line chart
    const getLinePath = (points, width, height, maxValue, minValue) => {
        if (points.length === 0) return '';

        const range = maxValue - minValue || 1;
        const xStep = width / (points.length - 1);

        return points.map((point, index) => {
            const x = index * xStep;
            const y = height - ((point.y - minValue) / range) * height;
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    // Calculate area path for the filled area
    const getAreaPath = (points, width, height, maxValue, minValue) => {
        if (points.length === 0) return '';

        const range = maxValue - minValue || 1;
        const xStep = width / (points.length - 1);

        const linePath = points.map((point, index) => {
            const x = index * xStep;
            const y = height - ((point.y - minValue) / range) * height;
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');

        const lastPoint = points[points.length - 1];
        const lastX = (points.length - 1) * xStep;
        const firstX = 0;

        return `${linePath} L ${lastX} ${height} L ${firstX} ${height} Z`;
    };

    if (isLoading) {
        return (
            <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>Revenue Trend</h3>
                    <div className={styles.chartControls}>
                        <div className={styles.skeletonControl}></div>
                    </div>
                </div>
                <div className={styles.chartSkeleton}>
                    <div className={styles.skeletonChart}></div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>Revenue Trend</h3>
                </div>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📊</div>
                    <p className={styles.emptyText}>No revenue data available for the selected period</p>
                </div>
            </div>
        );
    }

    const { points, maxValue, minValue } = chartData;
    console.log('RevenueChart points:', points);
    const chartWidth = 800;
    const chartHeight = 300;
    const padding = 40;

    const linePath = getLinePath(points, chartWidth - 2 * padding, chartHeight - 2 * padding, maxValue, minValue);
    const areaPath = getAreaPath(points, chartWidth - 2 * padding, chartHeight - 2 * padding, maxValue, minValue);

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Revenue Trend</h3>
                <div className={styles.chartControls}>
                    <span className={styles.periodLabel}>
                        {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}ly View
                    </span>
                </div>
            </div>

            <div className={styles.chartWrapper}>
                <svg
                    width={chartWidth}
                    height={chartHeight}
                    className={styles.chart}
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                >
                    {/* Grid lines */}
                    <defs>
                        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.3"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Area fill */}
                    <path
                        d={areaPath}
                        fill="url(#areaGradient)"
                        opacity="0.3"
                        transform={`translate(${padding}, ${padding})`}
                    />

                    {/* Line */}
                    <path
                        d={linePath}
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        fill="none"
                        transform={`translate(${padding}, ${padding})`}
                        className={styles.chartLine}
                    />

                    {/* Data points */}
                    {points.map((point, index) => {
                        const x = index * ((chartWidth - 2 * padding) / (points.length - 1)) + padding;
                        const y = chartHeight - padding - ((point.y - minValue) / (maxValue - minValue || 1)) * (chartHeight - 2 * padding);

                        return (
                            <g key={index}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="#3b82f6"
                                    className={styles.dataPoint}
                                    onMouseEnter={() => setHoveredPoint(point)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                />
                                {hoveredPoint === point && (
                                    <g className={styles.tooltip}>
                                        <rect
                                            x={x + 10}
                                            y={y - 40}
                                            width="120"
                                            height="80"
                                            fill="#1f2937"
                                            rx="8"
                                            className={styles.tooltipBox}
                                        />
                                        <text x={x + 20} y={y - 20} fill="white" fontSize="12" fontWeight="600">
                                            {formatDate(point.date, groupBy)}
                                        </text>
                                        <text x={x + 20} y={y - 5} fill="white" fontSize="11">
                                            Revenue: {formatCurrency(point.y)}
                                        </text>
                                        <text x={x + 20} y={y + 10} fill="white" fontSize="11">
                                            Orders: {point.orders}
                                        </text>
                                        <text x={x + 20} y={y + 25} fill="white" fontSize="11">
                                            Avg: {formatCurrency(point.avgOrderValue)}
                                        </text>
                                    </g>
                                )}
                            </g>
                        );
                    })}

                    {/* Gradients */}
                    <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6"/>
                            <stop offset="100%" stopColor="#8b5cf6"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className={styles.chartFooter}>
                <div className={styles.summary}>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Total Revenue:</span>
                        <span className={styles.summaryValue}>
                            {formatCurrency(points.reduce((sum, p) => {
                                console.log('Total Revenue - Current sum:', sum, 'Current p.y:', p.y, 'New sum:', sum + p.y);
                                return sum + p.y;
                            }, 0))}
                        </span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Total Orders:</span>
                        <span className={styles.summaryValue}>
                            {points.reduce((sum, p) => {
                                console.log('Total Orders - Current sum:', sum, 'Current p.orders:', p.orders, 'New sum:', sum + p.orders);
                                return sum + p.orders;
                            }, 0).toLocaleString()}
                        </span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Avg Order Value:</span>
                        <span className={styles.summaryValue}>
                            {formatCurrency(points.reduce((sum, p) => {
                                console.log('Avg Order Value - Current sum:', sum, 'Current p.avgOrderValue:', p.avgOrderValue, 'New sum:', sum + p.avgOrderValue);
                                return sum + p.avgOrderValue;
                            }, 0) / points.length)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueChart;
