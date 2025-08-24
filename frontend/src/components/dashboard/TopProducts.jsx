import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';

const TopProducts = ({ products = [], onProductClick }) => {
    const navigate = useNavigate();

    const handleProductClick = (product) => {
        if (onProductClick) {
            onProductClick(product);
        }
    };

    const handleViewAllProducts = () => {
        navigate('/admin/products');
    };

    if (products.length === 0) {
        return (
            <div className={styles.topProductsCard}>
                <div className={styles.cardHeader}>
                    <h2>Top Products</h2>
                    <button 
                        className={styles.viewAllButton}
                        onClick={handleViewAllProducts}
                    >
                        View All
                    </button>
                </div>
                <div className={styles.emptyState}>
                    <p>No products ordered yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.topProductsCard}>
            <div className={styles.cardHeader}>
                <h2>Top Products</h2>
                <button 
                    className={styles.viewAllButton}
                    onClick={handleViewAllProducts}
                >
                    View All
                </button>
            </div>
            <div className={styles.productsList}>
                {products.map((product, index) => (
                    <div 
                        key={product.id} 
                        className={styles.productItem}
                        onClick={() => handleProductClick(product)}
                    >
                        <div className={styles.productRank}>
                            <span className={styles.rankNumber}>#{index + 1}</span>
                        </div>
                        <div className={styles.productInfo}>
                            <span className={styles.productName}>
                                {product.name}
                            </span>
                            <div className={styles.productStats}>
                                <span className={styles.orderCount}>
                                    {product.order_count || 0} orders
                                </span>
                                <span className={styles.quantitySold}>
                                    {product.total_quantity_sold || 0} sold
                                </span>
                            </div>
                        </div>
                        <div className={styles.productPrice}>
                            <span className={styles.price}>
                                ${parseFloat(product.price).toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopProducts;
