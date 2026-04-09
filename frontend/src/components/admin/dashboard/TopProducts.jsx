import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../../context/SettingsProvider';
import { formatPrice } from '../../../utils/price.utils';
import Pagination from './Pagination';
import styles from './dashboard.module.css';

const TopProducts = ({ 
    products = [], 
    onProductClick, 
    timeFilter = 'all',
    sortOrder = 'best',
    onTimeFilterChange,
    onSortChange
}) => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const currency = settings?.currency || 'ILS';
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Reset to first page when products or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [products, timeFilter, sortOrder]);

    // Products are already filtered and sorted by parent component
    const sortedProducts = products;
    
    const handleProductClick = (product) => {
        if (onProductClick) {
            onProductClick(product);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSortChange = (order) => {
        setCurrentPage(1); // Reset to first page
        if (onSortChange) {
            onSortChange(order);
        }
    };

    const handleTimeFilterChange = (time) => {
        setCurrentPage(1);
        if (onTimeFilterChange) {
            onTimeFilterChange(time);
        }
    };

    // Calculate pagination with sorted products
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = sortedProducts.slice(startIndex, endIndex);

    return (
        <div className={styles.sectionContainer}>
            {/* Section Header with Inline Controls */}
            <div className={styles.sectionHeaderInline}>
                {/* Section Title */}
                <h2 className={styles.sectionTitle}>Top Products</h2>

                {/* Time Filter */}
                <select 
                    className={styles.filterSelectInline}
                    value={timeFilter}
                    onChange={(e) => handleTimeFilterChange(e.target.value)}
                >
                    <option value="all">All Time</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="1y">Last Year</option>
                </select>

                {/* Sort Filter */}
                <select 
                    className={styles.filterSelectInline}
                    value={sortOrder}
                    onChange={(e) => handleSortChange(e.target.value)}
                >
                    <option value="best">Best Sellers</option>
                    <option value="worst">Worst Sellers</option>
                </select>

                <span className={styles.resultCountInline}>
                    {startIndex + 1}-{Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length}
                </span>
                
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
                    onClick={() => navigate('/admin/products', { 
                        state: { filter: 'top-selling' }
                    })}
                >
                    View All ({sortedProducts.length})
                </button>
            </div>

            {products.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No top products found</p>
                </div>
            ) : (
                <div className={styles.squareCardsGrid}>
                    {currentProducts.map((product, index) => (
                <div 
                    key={product.id} 
                    className={styles.topProductCard}
                    onClick={() => handleProductClick(product)}
                >
                    <div className={styles.topProductCardHeader}>
                        <div className={styles.topProductRank}>
                            <span className={styles.rankNumber}>#{startIndex + index + 1}</span>
                        </div>
                        <div className={styles.topProductTitle}>
                            <h3>{product.name}</h3>
                            <span className={styles.topProductSku}>ID: {product.id || 'N/A'}</span>
                        </div>
                        <div className={styles.topProductBadge}>
                            Top Seller
                        </div>
                    </div>
                    
                    <div className={styles.topProductCardContent}>
                        <div className={styles.topProductRow}>
                            <span className={styles.topProductLabel}>Category:</span>
                            <span className={styles.topProductValue}>
                                {product.category_name || 'N/A'}
                            </span>
                        </div>
                        
                        <div className={styles.topProductRow}>
                            <span className={styles.topProductLabel}>Price:</span>
                            <span className={styles.topProductValue}>
                                {formatPrice(product.price || 0, currency)}
                            </span>
                        </div>
                        
                        <div className={styles.topProductRow}>
                            <span className={styles.topProductLabel}>Sales:</span>
                            <span className={styles.topProductValue}>
                                {product.total_sales || 0}
                            </span>
                        </div>
                        
                        <div className={styles.topProductRow}>
                            <span className={styles.topProductLabel}>Revenue:</span>
                            <span className={`${styles.topProductValue} ${styles.topProductRevenue}`}>
                                {formatPrice(product.total_revenue || 0, currency)}
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

export default TopProducts;
