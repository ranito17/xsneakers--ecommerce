import React from 'react';
import styles from './productList.module.css';

const ProductPagination = ({ currentPage, totalPages, onPageChange }) => {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={styles.productPaginationContainer}>
            <button
                className={`${styles.productPaginationArrow} ${currentPage === 1 ? styles.disabled : ''}`}
                onClick={handlePrevious}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
            </button>

            <div className={styles.productPaginationInfo}>
                <span className={styles.productCurrentPage}>{currentPage}</span>
                <span className={styles.productPageSeparator}>/</span>
                <span className={styles.productTotalPages}>{totalPages}</span>
            </div>

            <button
                className={`${styles.productPaginationArrow} ${currentPage === totalPages ? styles.disabled : ''}`}
                onClick={handleNext}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
            </button>
        </div>
    );
};

export default ProductPagination;

