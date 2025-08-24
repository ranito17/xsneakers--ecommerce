import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';

const LowStockAlert = ({ products = [], onThresholdChange, onProductClick }) => {
    const navigate = useNavigate();
    const [threshold, setThreshold] = useState(10);

    const handleThresholdChange = (e) => {
        const newThreshold = parseInt(e.target.value);
        setThreshold(newThreshold);
        if (onThresholdChange) {
            onThresholdChange(newThreshold);
        }
    };

    const handleProductClick = (product) => {
        if (onProductClick) {
            onProductClick(product);
        }
    };

    const handleViewAllProducts = () => {
        navigate('/admin/products', { state: { quantityFilter: threshold } });
    };

    if (products.length === 0) {
        return (
            <div className={styles.lowStockCard}>
                <div className={styles.cardHeader}>
                    <h2>Low Stock Alert</h2>
                    <div className={styles.thresholdControl}>
                        <label htmlFor="threshold">Alert when stock ≤</label>
                        <input
                            id="threshold"
                            type="number"
                            min="1"
                            max="100"
                            value={threshold}
                            onChange={handleThresholdChange}
                            className={styles.thresholdInput}
                        />
                    </div>
                </div>
                <div className={styles.emptyState}>
                    <p>All products have sufficient stock</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.lowStockCard}>
            <div className={styles.cardHeader}>
                <h2>Low Stock Alert</h2>
                <div className={styles.headerControls}>
                    <div className={styles.thresholdControl}>
                        <label htmlFor="threshold">Alert when stock ≤</label>
                        <input
                            id="threshold"
                            type="number"
                            min="1"
                            max="100"
                            value={threshold}
                            onChange={handleThresholdChange}
                            className={styles.thresholdInput}
                        />
                    </div>
                    <button 
                        className={styles.viewAllButton}
                        onClick={handleViewAllProducts}
                    >
                        View All
                    </button>
                </div>
            </div>
            <div className={styles.stockList}>
                {products.map(product => (
                    <div 
                        key={product.id} 
                        className={styles.stockItem}
                        onClick={() => handleProductClick(product)}
                    >
                        <div className={styles.productInfo}>
                            <span className={styles.productName}>
                                {product.name}
                            </span>
                            <span className={styles.productCategory}>
                                {product.category_name}
                            </span>
                        </div>
                        <div className={styles.stockInfo}>
                            <span className={`${styles.stockCount} ${product.stock_quantity <= 5 ? styles.critical : ''}`}>
                                {product.stock_quantity} left
                            </span>
                            <span className={styles.productPrice}>
                                ${parseFloat(product.price).toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LowStockAlert;
