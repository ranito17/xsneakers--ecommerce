import React from 'react';
import ProductCard from "../productCard/productCard";
import styles from './productList.module.css';

const ProductList = ({ products, onImageClick }) => {

    return (
        <>
            <div className={styles.productListContainer}>
                {/* Results Info */}
                <div className={styles.resultsInfo}>
                    <span className={styles.resultsCount}>
                        {products.length} products
                    </span>
                </div>

                {/* Products Grid */}
                {products.length > 0 ? (
                    <div className={styles.productsGrid}>
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onImageClick={onImageClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <svg className={styles.emptyIcon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                        </svg>
                        <h3>No products available</h3>
                        <p>Products will appear here once they're added to the catalog.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProductList;