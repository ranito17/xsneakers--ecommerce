import React, { useState, useEffect } from 'react';
import AdminOrderCard from '../adminOrderCard/AdminOrderCard';
import styles from './adminOrderList.module.css';

const AdminOrderList = ({ 
    orders, 
    loading, 
    error,
    onViewDetails,
    onUpdateStatus,
    onDeleteOrder,
    onEditOrder 
}) => {
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('orderDate');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        if (orders) {
            setFilteredOrders(orders);
        }
    }, [orders]);

    // Sorting function
    const sortOrders = (ordersToSort) => {
        return [...ordersToSort].sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            // Handle date sorting
            if (sortBy === 'orderDate') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

           
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    // Get current orders for pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const sortedOrders = sortOrders(filteredOrders);
    const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle sorting
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    // Get sort icon
    const getSortIcon = (field) => {
        if (sortBy !== field) return '↕️';
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loading}>Loading orders...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.error}>
                    <p>Error loading orders: {error}</p>
                    <button onClick={() => window.location.reload()} className={styles.retryButton}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <div className={styles.emptyState}>
                    <h3>No Orders Found</h3>
                    <p>There are no orders to display at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.orderListContainer}>
            {/* Sort Controls */}
            <div className={styles.sortControls}>
                <div className={styles.sortSection}>
                    <span className={styles.sortLabel}>Sort by:</span>
                    <div className={styles.sortButtons}>
                        <button
                            onClick={() => handleSort('orderDate')}
                            className={`${styles.sortButton} ${sortBy === 'orderDate' ? styles.active : ''}`}
                        >
                            Date {getSortIcon('orderDate')}
                        </button>
                        <button
                            onClick={() => handleSort('totalAmount')}
                            className={`${styles.sortButton} ${sortBy === 'totalAmount' ? styles.active : ''}`}
                        >
                            Amount {getSortIcon('totalAmount')}
                        </button>
                        <button
                            onClick={() => handleSort('customerName')}
                            className={`${styles.sortButton} ${sortBy === 'customerName' ? styles.active : ''}`}
                        >
                            Customer {getSortIcon('customerName')}
                        </button>
                        <button
                            onClick={() => handleSort('status')}
                            className={`${styles.sortButton} ${sortBy === 'status' ? styles.active : ''}`}
                        >
                            Status {getSortIcon('status')}
                        </button>
                    </div>
                </div>
                
                <div className={styles.resultsInfo}>
                    Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
            </div>

            {/* Orders List */}
            <div className={styles.ordersList}>
                {currentOrders.map(order => (
                    <AdminOrderCard
                        key={order.id}
                        order={order}
                        onViewDetails={onViewDetails}
                        onUpdateStatus={onUpdateStatus}
                        onDeleteOrder={onDeleteOrder}
                        onEditOrder={onEditOrder}
                    />
                ))}
            </div>

            {/* Pagination */}
            {filteredOrders.length > ordersPerPage && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                    >
                        Previous
                    </button>
                    
                    <div className={styles.pageNumbers}>
                        {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }, (_, i) => i + 1)
                            .filter(page => {
                                // Show first page, last page, current page, and pages around current
                                return page === 1 || 
                                       page === Math.ceil(filteredOrders.length / ordersPerPage) ||
                                       Math.abs(page - currentPage) <= 1;
                            })
                            .map((page, index, array) => {
                                // Add ellipsis if there's a gap
                                if (index > 0 && page - array[index - 1] > 1) {
                                    return (
                                        <React.Fragment key={`ellipsis-${page}`}>
                                            <span className={styles.ellipsis}>...</span>
                                            <button
                                                onClick={() => paginate(page)}
                                                className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    );
                                }
                                return (
                                    <button
                                        key={page}
                                        onClick={() => paginate(page)}
                                        className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                    </div>
                    
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
                        className={styles.paginationButton}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminOrderList; 