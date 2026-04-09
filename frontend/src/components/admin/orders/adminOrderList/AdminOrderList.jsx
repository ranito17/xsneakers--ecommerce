import React, { useState, useEffect } from 'react';
import AdminOrderCard from '../adminOrderCard/AdminOrderCard';
import styles from './adminOrderList.module.css';

const AdminOrderList = ({ 
    orders, 
    orderItems = {},
    loading, 
    error,
    onUpdateStatus,
    onViewOrder,
    onOpenImageModal
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(12); // Increased for grid layout

    // Get current orders for pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Reset to page 1 when orders change
    useEffect(() => {
        setCurrentPage(1);
    }, [orders]);

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
            {/* Orders Grid */}
            <div className={styles.ordersGrid}>
                {currentOrders.map(order => (
                    <AdminOrderCard
                        key={order.id}
                        order={order}
                        orderItems={orderItems[order.id] || []}
                        onUpdateStatus={onUpdateStatus}
                        onViewOrder={onViewOrder}
                        onOpenImageModal={onOpenImageModal}
                    />
                ))}
            </div>

            {/* Pagination */}
            {orders.length > ordersPerPage && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                    >
                        Previous
                    </button>
                    
                    <div className={styles.pageNumbers}>
                        {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }, (_, i) => i + 1)
                            .filter(page => {
                                // Show first page, last page, current page, and pages around current
                                return page === 1 || 
                                       page === Math.ceil(orders.length / ordersPerPage) ||
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
                        disabled={currentPage === Math.ceil(orders.length / ordersPerPage)}
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