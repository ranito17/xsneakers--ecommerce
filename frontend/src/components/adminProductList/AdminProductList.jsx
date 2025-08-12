import React from 'react';
import AdminProductCard from '../adminProductCard/AdminProductCard';
import styles from './adminProductList.module.css';

const AdminProductList = ({ 
    products, 
    onEdit, 
    onDelete, 
    onImageUpload, 
    onImageDelete, 
    isLoading,
    appliedFilters = ''
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

    if (products.length === 0) {
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
            <div className={styles.listHeader}>
                <div className={styles.listStats}>
                    <span className={styles.statItem}>
                        <strong>Total:</strong> {products.length}
                    </span>
                    <span className={styles.statItem}>
                        <strong>In Stock:</strong> {products.filter(p => p.stock_quantity > 0).length}
                    </span>
                    <span className={styles.statItem}>
                        <strong>Out of Stock:</strong> {products.filter(p => p.stock_quantity === 0).length}
                    </span>
                </div>
                
                {appliedFilters && (
                    <div className={styles.appliedFilters}>
                        <strong>Applied Filters:</strong> {appliedFilters}
                    </div>
                )}
            </div>

            <div className={styles.productsGrid}>
                {filteredProducts.map(product => (
                    <AdminProductCard
                        key={product.id}
                        product={product}
                        onEdit={() => onEdit(product)}
                        onDelete={() => onDelete(product.id)}
                        onImageUpload={onImageUpload}
                        onImageDelete={onImageDelete}
                    />
                ))}
            </div>
        </div>
    );
};

export default AdminProductList; 