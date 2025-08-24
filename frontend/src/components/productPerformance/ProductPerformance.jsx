import React, { useState, useMemo } from 'react';
import styles from './productPerformance.module.css';

const ProductPerformance = ({ data = {}, isLoading = false }) => {
    const [sortField, setSortField] = useState('total_revenue');
    const [sortDirection, setSortDirection] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');

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

    // Helper function to calculate percentage
    const calculatePercentage = (value, total) => {
        if (!total || total === 0) return 0;
        return Math.round(((value / total) * 100) * 10) / 10; // Round to 1 decimal place
    };

    // Sort and filter data
    const processedData = useMemo(() => {
        if (!data.productPerformance) return [];

        let filteredData = data.productPerformance.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort data
        filteredData.sort((a, b) => {
            let aValue = a[sortField] || 0;
            let bValue = b[sortField] || 0;

            if (sortDirection === 'asc') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        });

        return filteredData;
    }, [data.productPerformance, sortField, sortDirection, searchTerm]);

    // Calculate totals for percentage calculations
    const totals = useMemo(() => {
        if (!data.productPerformance) return {};

        return {
            totalRevenue: data.productPerformance.reduce((sum, p) => sum + (parseFloat(p.total_revenue) || 0), 0),
            totalOrders: data.productPerformance.reduce((sum, p) => sum + (parseInt(p.total_orders) || 0), 0),
            totalQuantity: data.productPerformance.reduce((sum, p) => sum + (parseInt(p.total_quantity_sold) || 0), 0)
        };
    }, [data.productPerformance]);

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    // Get sort indicator
    const getSortIndicator = (field) => {
        if (sortField !== field) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Product Performance</h3>
                    <div className={styles.skeletonControls}>
                        <div className={styles.skeletonSearch}></div>
                    </div>
                </div>
                <div className={styles.tableSkeleton}>
                    {[1, 2, 3, 4, 5].map((index) => (
                        <div key={index} className={styles.skeletonRow}>
                            <div className={styles.skeletonCell}></div>
                            <div className={styles.skeletonCell}></div>
                            <div className={styles.skeletonCell}></div>
                            <div className={styles.skeletonCell}></div>
                            <div className={styles.skeletonCell}></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data.productPerformance || data.productPerformance.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Product Performance</h3>
                </div>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📦</div>
                    <p className={styles.emptyText}>No product performance data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Product Performance</h3>
                <div className={styles.controls}>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <span className={styles.searchIcon}>🔍</span>
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th 
                                className={styles.sortableHeader}
                                onClick={() => handleSort('name')}
                            >
                                Product Name {getSortIndicator('name')}
                            </th>
                            <th 
                                className={styles.sortableHeader}
                                onClick={() => handleSort('total_revenue')}
                            >
                                Revenue {getSortIndicator('total_revenue')}
                            </th>
                            <th 
                                className={styles.sortableHeader}
                                onClick={() => handleSort('total_orders')}
                            >
                                Orders {getSortIndicator('total_orders')}
                            </th>
                            <th 
                                className={styles.sortableHeader}
                                onClick={() => handleSort('total_quantity_sold')}
                            >
                                Quantity Sold {getSortIndicator('total_quantity_sold')}
                            </th>
                            <th 
                                className={styles.sortableHeader}
                                onClick={() => handleSort('avg_quantity_per_order')}
                            >
                                Avg Qty/Order {getSortIndicator('avg_quantity_per_order')}
                            </th>
                            <th>Stock Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedData.map((product, index) => (
                            <tr key={product.id || index} className={styles.tableRow}>
                                <td className={styles.productCell}>
                                    <div className={styles.productInfo}>
                                        <span className={styles.productName}>{product.name}</span>
                                        <span className={styles.productPrice}>
                                            {formatCurrency(product.price)}
                                        </span>
                                    </div>
                                </td>
                                <td className={styles.revenueCell}>
                                    <div className={styles.revenueInfo}>
                                        <span className={styles.revenueAmount}>
                                            {formatCurrency(parseFloat(product.total_revenue) || 0)}
                                        </span>
                                        <span className={styles.revenuePercentage}>
                                            {calculatePercentage(parseFloat(product.total_revenue) || 0, totals.totalRevenue)}%
                                        </span>
                                    </div>
                                </td>
                                <td className={styles.ordersCell}>
                                    <div className={styles.ordersInfo}>
                                        <span className={styles.ordersCount}>
                                            {formatNumber(parseInt(product.total_orders) || 0)}
                                        </span>
                                        <span className={styles.ordersPercentage}>
                                            {calculatePercentage(parseInt(product.total_orders) || 0, totals.totalOrders)}%
                                        </span>
                                    </div>
                                </td>
                                <td className={styles.quantityCell}>
                                    {formatNumber(product.total_quantity_sold)}
                                </td>
                                <td className={styles.avgQuantityCell}>
                                    {Math.round((parseFloat(product.avg_quantity_per_order) || 0) * 10) / 10 || '0.0'}
                                </td>
                                <td className={styles.stockCell}>
                                    <div className={styles.stockStatus}>
                                        <span className={`${styles.stockIndicator} ${
                                            product.remaining_stock > 10 ? styles.inStock :
                                            product.remaining_stock > 0 ? styles.lowStock :
                                            styles.outOfStock
                                        }`}>
                                            {product.remaining_stock > 10 ? '●' : 
                                             product.remaining_stock > 0 ? '●' : '●'}
                                        </span>
                                        <span className={styles.stockText}>
                                            {product.remaining_stock > 10 ? 'In Stock' :
                                             product.remaining_stock > 0 ? 'Low Stock' : 'Out of Stock'}
                                        </span>
                                        <span className={styles.stockCount}>
                                            ({product.remaining_stock})
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.footer}>
                <div className={styles.summary}>
                    <span className={styles.summaryText}>
                        Showing {processedData.length} of {data.productPerformance?.length || 0} products
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductPerformance;
