import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../../context/SettingsProvider';
import { formatPrice } from '../../../utils/price.utils';
import Pagination from './Pagination';
import { ProductSizesModal } from '../../admin/products';
import styles from './dashboard.module.css';

const LowStockAlert = ({ products = [], onThresholdChange, onProductClick, onViewModeChange }) => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const currency = settings?.currency || 'ILS';
    const [threshold, setThreshold] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState('total'); // 'total' or 'bySize'
    const [sortBy, setSortBy] = useState('quantity'); // 'quantity', 'name', 'price'
    const itemsPerPage = 6;
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Reset to first page when products change
    useEffect(() => {
        setCurrentPage(1);
    }, [products]);

    const handleThresholdChange = (e) => {
        const newThreshold = parseInt(e.target.value);
        setThreshold(newThreshold);
        if (onThresholdChange) {
            onThresholdChange(newThreshold);
        }
    };

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setCurrentPage(1);
        if (onViewModeChange) {
            onViewModeChange(mode);
        }
    };

    const handleSortChange = (sort) => {
        setSortBy(sort);
        setCurrentPage(1);
    };

    const getStockStatus = (quantity) => {
        if (quantity <= 5) return 'critical';
        if (quantity <= threshold) return 'low';
        return 'normal';
    };

    // Sort products based on selected criteria
    const sortedProducts = [...products].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            case 'price':
                return (b.price || 0) - (a.price || 0); // High to low
            case 'quantity':
            default:
                return (a.quantity || 0) - (b.quantity || 0); // Low to high (most critical first)
        }
    });

    // Calculate pagination
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = sortedProducts.slice(startIndex, endIndex);

    return (
        <div className={styles.sectionContainer}>
            {/* Section Header with Inline Controls */}
            <div className={styles.sectionHeaderInline}>
                {/* Section Title */}
                <h2 className={styles.sectionTitle}>Low Stock Alert</h2>
                {/* View Mode Filter */}
                <select 
                    className={styles.filterSelectInline}
                    value={viewMode}
                    onChange={(e) => handleViewModeChange(e.target.value)}
                >
                    <option value="total">Total Stock Low</option>
                    <option value="bySize">Sizes Below Threshold</option>
                </select>

                {/* Sort Filter */}
                <select 
                    className={styles.filterSelectInline}
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                >
                    <option value="quantity">Most Critical</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="price">Price (High-Low)</option>
                </select>

                <span className={styles.resultCountInline}>
                    {sortedProducts.length} item{sortedProducts.length !== 1 ? 's' : ''}
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
                        state: { filter: viewMode === 'bySize' ? 'low-stock-size' : 'low-stock' }
                    })}
                    title="View all low stock products"
                >
                    View All ({sortedProducts.length})
                </button>
            </div>

            {products.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No low stock products found</p>
                </div>
            ) : (
                <div className={styles.squareCardsGrid}>
                    {currentProducts.map((product) => {
                const stockStatus = getStockStatus(product.quantity);
                return (
                    <div 
                        key={product.id} 
                        className={styles.stockCard}
                        onClick={() => handleProductClick(product)}
                    >
                        <div className={styles.stockCardHeader}>
                            <div className={styles.stockCardTitle}>
                                <h3>{product.name}</h3>
                                <span className={styles.stockCardSku}>ID: {product.id || 'N/A'}</span>
                            </div>
                            <div className={`${styles.stockStatus} ${styles[stockStatus]}`}>
                                ID: {product.id}
                            </div>
                        </div>
                        
                        <div className={styles.stockCardContent}>
                            <div className={styles.stockCardRow}>
                                <span className={styles.stockCardLabel}>Category:</span>
                                <span className={styles.stockCardValue}>
                                    {product.category_name || 'N/A'}
                                </span>
                            </div>
                            
                            <div className={styles.stockCardRow}>
                                <span className={styles.stockCardLabel}>Price:</span>
                                <span className={styles.stockCardValue}>
                                    {formatPrice(product.price || 0, currency)}
                                </span>
                            </div>
                            
                            <div className={styles.stockCardRow}>
                                <span className={styles.stockCardLabel}>Stock:</span>
                                <span className={`${styles.stockCardValue} ${styles.stockQuantity}`}>
                                    {product.quantity || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                );
                    })}
                </div>
            )}

            {/* Sizes Modal */}
            {isModalOpen && selectedProduct && (
                <ProductSizesModal
                    product={selectedProduct}
                    onClose={handleCloseModal}
                    onSave={async () => {
                        handleCloseModal();
                    }}
                    mode="view"
                />
            )}
        </div>
    );
};

export default LowStockAlert;
