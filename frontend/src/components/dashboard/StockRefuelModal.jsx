import React, { useState, useEffect } from 'react';
import { supplierApi } from '../../services/supplierApi';
import { productApi } from '../../services/productApi';
import styles from './dashboard.module.css';

const StockRefuelModal = ({ isOpen, onClose, onSuccess }) => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLowStockProducts();
        }
    }, [isOpen]);

    const fetchLowStockProducts = async () => {
        try {
            const response = await productApi.getLowStockProducts(10);
            if (response.success) {
                setProducts(response.data);
            }
        } catch (error) {
            console.error('Error fetching low stock products:', error);
        }
    };

    const handleProductToggle = (product) => {
        setSelectedProducts(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                return prev.filter(p => p.id !== product.id);
            } else {
                return [...prev, {
                    id: product.id,
                    name: product.name,
                    quantity: 1,
                    currentStock: product.stock_quantity
                }];
            }
        });
    };

    const handleQuantityChange = (productId, quantity) => {
        setSelectedProducts(prev =>
            prev.map(p =>
                p.id === productId
                    ? { ...p, quantity: Math.max(1, parseInt(quantity) || 1) }
                    : p
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (selectedProducts.length === 0) {
            setError('Please select at least one product');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await supplierApi.sendStockRefuelEmail({
                products: selectedProducts,
                notes: notes.trim() || undefined
            });

            if (response.success) {
                setSuccess(true);
                setSelectedProducts([]);
                setNotes('');
                if (onSuccess) {
                    onSuccess(response.data);
                }
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setSelectedProducts([]);
            setNotes('');
            setError(null);
            setSuccess(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>Send Stock Refuel Request</h2>
                    <button 
                        className={styles.closeButton}
                        onClick={handleClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                {success ? (
                    <div className={styles.modalContent}>
                        <div className={styles.successMessage}>
                            <div className={styles.successIcon}>✅</div>
                            <h3>Stock Refuel Email Sent!</h3>
                            <p>The supplier has been notified and will receive an email with the fulfillment button.</p>
                            <button 
                                className={styles.primaryButton}
                                onClick={handleClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.modalContent}>
                        <div className={styles.formSection}>
                            <h3>Select Products to Refuel</h3>
                            <div className={styles.productList}>
                                {products.map(product => {
                                    const isSelected = selectedProducts.find(p => p.id === product.id);
                                    return (
                                        <div 
                                            key={product.id} 
                                            className={`${styles.productItem} ${isSelected ? styles.selected : ''}`}
                                            onClick={() => handleProductToggle(product)}
                                        >
                                            <div className={styles.productInfo}>
                                                <span className={styles.productName}>{product.name}</span>
                                                <span className={styles.productCategory}>{product.category_name}</span>
                                                <span className={styles.stockCount}>
                                                    Current stock: {product.stock_quantity}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <div className={styles.quantityInput}>
                                                    <label>Quantity needed:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={isSelected.quantity}
                                                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={styles.quantityField}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3>Selected Products</h3>
                            {selectedProducts.length === 0 ? (
                                <p className={styles.noSelection}>No products selected</p>
                            ) : (
                                <div className={styles.selectedProducts}>
                                    {selectedProducts.map(product => (
                                        <div key={product.id} className={styles.selectedProduct}>
                                            <span>{product.name}</span>
                                            <span className={styles.quantity}>{product.quantity} units</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.formSection}>
                            <label htmlFor="notes">Additional Notes (Optional)</label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any special instructions or notes for the supplier..."
                                rows="3"
                                className={styles.textarea}
                            />
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className={styles.secondaryButton}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || selectedProducts.length === 0}
                                className={styles.primaryButton}
                            >
                                {loading ? 'Sending...' : 'Send Refuel Request'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StockRefuelModal;
