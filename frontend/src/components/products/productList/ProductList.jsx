/**
 * קומפוננטת רשימת מוצרים - ProductList
 * 
 * מציגה רשימת מוצרים בגריד ומעבירה props ל-ProductCard
 */
import React from 'react';
import ProductCard from "../productCard/productCard";
import ProductPagination from './ProductPagination';
import styles from './productList.module.css';

/**
 * @param {Array} products - מערך של מוצרים להצגה
 * @param {number} totalProducts - סך הכל מוצרים לאחר פילטור
 * @param {number} currentPage - עמוד נוכחי
 * @param {number} totalPages - סך הכל עמודים
 * @param {number} itemsPerPage - מספר מוצרים לעמוד
 * @param {Function} onPageChange - פונקציה לעדכון עמוד
 * @param {Function} onImageClick - פונקציה לקריאה בעת לחיצה על תמונה
 * @param {Array} wishlistIds - מערך של ID-ים של מוצרים ב-wishlist
 * @param {Function} onAddToWishlist - פונקציה להוספת מוצר ל-wishlist
 * @param {Function} onRemoveFromWishlist - פונקציה להסרת מוצר מ-wishlist
 * @param {boolean} isAuthenticated - האם המשתמש מאומת
 * @param {Object} user - אובייקט המשתמש
 */
const ProductList = ({ 
    products, 
    totalProducts,
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    onImageClick,
    wishlistIds = [],
    onAddToWishlist,
    onRemoveFromWishlist,
    isAuthenticated,
    user
}) => {

    return (
        <>
            <div className={styles.productListContainer}>
                {/* Products Grid */}
                {products.length > 0 ? (
                    <>
                        <div className={styles.productsGrid}>
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onImageClick={onImageClick}
                                    isInWishlist={wishlistIds.includes(Number(product.id))}
                                    onAddToWishlist={onAddToWishlist}
                                    onRemoveFromWishlist={onRemoveFromWishlist}
                                    isAuthenticated={isAuthenticated}
                                    user={user}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className={styles.paginationWrapper}>
                                <ProductPagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={onPageChange}
                                />
                            </div>
                        )}
                    </>
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