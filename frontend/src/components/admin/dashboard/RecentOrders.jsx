import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../../context/SettingsProvider';
import { formatDate } from '../../../utils/date.utils';
import { formatPrice } from '../../../utils/price.utils';
import Pagination from './Pagination';
import styles from './dashboard.module.css';

const RecentOrders = ({ orders = [], onOrderClick, onFiltersChange }) => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const currency = settings?.currency || 'ILS';
    const [filters, setFilters] = useState({
        status: 'pending',
        sortOrder: 'latest',
        dateRange: 'week'
    });
    const [filteredOrders, setFilteredOrders] = useState(orders);
    const hasInitialized = useRef(false);
    const lastFiltersRef = useRef(null);
    const isProcessingRef = useRef(false);
    const onFiltersChangeRef = useRef(onFiltersChange);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Keep callback ref up to date without triggering effects
    useEffect(() => {
        onFiltersChangeRef.current = onFiltersChange;
    }, [onFiltersChange]);

    // Update filtered orders when orders prop changes (from parent filter response)
    useEffect(() => {
        setFilteredOrders(orders);
        setCurrentPage(1); // Reset to first page when orders change
    }, [orders]);

    // Initialize filters on mount and handle filter changes
    useEffect(() => {
        // Prevent concurrent calls
        if (isProcessingRef.current) {
            return;
        }

        // Check if filters actually changed
        const filtersString = JSON.stringify(filters);
        if (lastFiltersRef.current === filtersString) {
            return; // Filters haven't changed, skip
        }
        lastFiltersRef.current = filtersString;

        // Get current callback from ref
        const callback = onFiltersChangeRef.current;
        if (!callback) {
            return;
        }

        if (!hasInitialized.current) {
            // Initial mount - call with default filters
            hasInitialized.current = true;
            isProcessingRef.current = true;
            Promise.resolve(callback(filters)).finally(() => {
                isProcessingRef.current = false;
            });
            return;
        }
        
        // After initial mount, only call when filters actually change
        isProcessingRef.current = true;
        Promise.resolve(callback(filters)).finally(() => {
            isProcessingRef.current = false;
        });
    }, [filters]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentOrders = filteredOrders.slice(startIndex, endIndex);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return styles.statusPending;
            case 'processing': return styles.statusProcessing;
            case 'shipped': return styles.statusShipped;
            case 'delivered': return styles.statusDelivered;
            case 'cancelled': return styles.statusCancelled;
            default: return styles.statusDefault;
        }
    };

    // handleOrderClick - מטפל בלחיצה על כרטיס הזמנה
    // שליחה לשרת: אין - מעביר לפעולה של ההורה
    // תגובה מהשרת: אין - מעביר לפעולה של ההורה
    const handleOrderClick = useCallback((order) => {
        if (onOrderClick) {
            onOrderClick(order);
        }
    }, [onOrderClick]);

    return (
        <div className={styles.sectionContainer}>
            {/* Section Header with Inline Controls */}
            <div className={styles.sectionHeaderInline}>
                {/* Section Title */}
                <h2 className={styles.sectionTitle}>Recent Orders</h2>

                {/* Filters */}
                <select 
                    className={styles.filterSelectInline}
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                
                <select 
                    className={styles.filterSelectInline}
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                >
                    <option value="latest">Latest First</option>
                    <option value="earliest">Earliest First</option>
                </select>
                
                <select 
                    className={styles.filterSelectInline}
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>

                {/* Spacer */}
                <div className={styles.spacer}></div>

                {/* Pagination */}
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />

                {/* View All Button */}
                <button 
                    className={styles.viewAllBtn}
                    onClick={() => navigate('/admin/orders')}
                >
                    View All ({filteredOrders.length})
                </button>
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No orders found</p>
                </div>
            ) : (
                <div className={styles.squareCardsGrid}>
                    {currentOrders.map((order) => (
                <div 
                    key={order.order_id} 
                    className={styles.orderCard}
                    onClick={() => handleOrderClick(order)}
                >
                    <div className={styles.orderHeader}>
                        <h3 className={styles.orderNumber}>
                            Order #{order.order_id}
                        </h3>
                        <span className={`${styles.status} ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                    
                    <div className={styles.orderInfo}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Customer:</span>
                            <span className={styles.value}>
                                {order.customer_name || 'N/A'}
                            </span>
                        </div>
                        
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Date:</span>
                            <span className={styles.value}>
                                {formatDate(order.created_at, 'short')}
                            </span>
                        </div>
                        
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Items:</span>
                            <span className={styles.value}>
                                {order.total_items || 0}
                            </span>
                        </div>
                        
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Total:</span>
                            <span className={styles.totalAmount}>
                                {formatPrice(order.total_amount || 0, currency)}
                            </span>
                        </div>
                    </div>
                </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentOrders;
