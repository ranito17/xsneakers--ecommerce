import React from 'react';
import AdminProductCard from '../adminProductCard/AdminProductCard';
import styles from './adminProductList.module.css';

const AdminProductList = ({ 
    products, 
    allProducts = [],
    onEdit, 
    onImageClick,
    onOpenSizesModal,
    onOpenImagesModal,
    isLoading,
    appliedFilters = '',
    // Settings from parent
    currency = '$',
    lowStockThreshold = 10,
    lowStockPerSizeThreshold = 5,
    getStockStatus,
    formatPrice
}) => {
    const getFilteredProducts = () => {
        return products; // We'll handle filtering in the parent component
    };

    const filteredProducts = getFilteredProducts();

    if (isLoading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading products...</p>
            </div>
        );
    }

    // Only show empty state if there are truly no products at all (initial load)
    if (allProducts.length === 0 && !isLoading) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                </div>
                <h3>No Products Found</h3>
                <p>Start by adding your first product to the store.</p>
            </div>
        );
    }

    return (
        <div className={styles.productList}>
            {filteredProducts.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                    </div>
                    <h3>No Products Found</h3>
                    <p>Try adjusting your filters or search term.</p>
                </div>
            ) : (
                <div className={styles.productsGrid}>
                    {filteredProducts.map(product => (
                        <AdminProductCard
                            key={product.id}
                            product={product}
                            onEdit={() => onEdit(product)}
                            onImageClick={onImageClick}
                            onOpenSizesModal={onOpenSizesModal}
                            onOpenImagesModal={onOpenImagesModal}
                            // Pass settings to AdminProductCard
                            currency={currency}
                            lowStockThreshold={lowStockThreshold}
                            getStockStatus={getStockStatus}
                            formatPrice={formatPrice}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminProductList; 