import React, { useState, useEffect } from 'react';
import { supplierApi } from '../../../services/supplierApi';
import { productApi } from '../../../services/productApi';
import { useSettings } from '../../../context/SettingsProvider';
import { useToast } from '../../common/toast';
import { getProductImage } from '../../../utils/image.utils';
import ProductSizesModal from '../products/ProductSizesModal';
import styles from './dashboard.module.css';

const StockRefuelModal = ({ isOpen, onClose, onSuccess }) => {
    const { settings } = useSettings();
    const { showSuccess, showError } = useToast();
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sizesModalOpen, setSizesModalOpen] = useState(false);
    const [selectedProductForSizes, setSelectedProductForSizes] = useState(null);
    const itemsPerPage = 10;

    useEffect(() => {
        if (isOpen) {
            fetchLowStockProducts();
            setCurrentPage(1);
        }
    }, [isOpen]);

    const fetchLowStockProducts = async () => {
        try {
            const sizeThreshold = settings?.low_stock_threshold_per_size || 5;
            console.log('Size threshold:', sizeThreshold);
            const response = await productApi.getProductsWithLowStockSizes(sizeThreshold);
            if (response.success) {
                console.log('Low stock products response:', response);
                console.log('First product sizes:', response.data[0]?.sizes);
                setProducts(response.data);
            }
        } catch (error) {
            console.error('Error fetching low stock products:', error);
        }
    };

    const handleProductClick = (product) => {
        // Filter to only show low stock sizes
        const productWithLowStockSizes = {
            ...product,
            sizes: product.low_stock_sizes || product.sizes || []
        };
        setSelectedProductForSizes(productWithLowStockSizes);
        setSizesModalOpen(true);
    };

    const handleSizesModalSave = async (productId, sizes, totalStock) => {
        // Find the product in the list
        const product = products.find(p => p.id === productId);
        if (!product) return;

        // Filter sizes with quantity >= 1 (only sizes that need refueling)
        const sizesWithQuantity = sizes.filter(s => {
            const qty = parseInt(s.quantity) || 0;
            return qty >= 1;
        });

        if (sizesWithQuantity.length === 0) {
            // Remove from selected if no valid sizes
            setSelectedProducts(prev => prev.filter(p => p.id !== productId));
            return;
        }

        // Update or add product to selected products
        setSelectedProducts(prev => {
            const exists = prev.find(p => p.id === productId);
            const selectedSizes = sizesWithQuantity.map(s => ({
                size: s.size,
                quantity: parseInt(s.quantity) || 1
            }));

            if (exists) {
                return prev.map(p => 
                    p.id === productId 
                        ? { ...p, selectedSizes }
                        : p
                );
            } else {
                return [...prev, {
                    id: product.id,
                    name: product.name,
                    selectedSizes: selectedSizes,
                    currentStock: product.stock_quantity
                }];
            }
        });
    };


    const getTotalQuantity = (product) => {
        return product.selectedSizes.reduce((total, s) => total + (s.quantity || 0), 0);
    };

    const hasValidQuantities = (product) => {
        // Check if product has at least one size selected with quantity >= 1
        return product.selectedSizes && 
               product.selectedSizes.length > 0 && 
               product.selectedSizes.some(s => {
                   const qty = parseInt(s.quantity) || 0;
                   return qty >= 1;
               });
    };

    // Get only products with valid quantities for display
    const getValidSelectedProducts = () => {
        return selectedProducts.filter(product => hasValidQuantities(product));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Only check products that have valid quantities (at least one size with quantity >= 1)
        const validProducts = getValidSelectedProducts();
        
        if (validProducts.length === 0) {
            setError('Please select at least one product with size and quantity');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Convert selectedSizes back to sizeQuantities format for API
            // Filter out sizes with quantity 0 or less
            const productsForApi = selectedProducts
                .filter(product => hasValidQuantities(product))
                .map(product => ({
                    id: product.id,
                    name: product.name,
                    sizeQuantities: product.selectedSizes.filter(s => {
                        const qty = parseInt(s.quantity) || 0;
                        return qty >= 1;
                    })
                }));

            const response = await supplierApi.sendStockRefuelEmail({
                products: productsForApi,
                notes: notes.trim() || undefined
            });

            if (response.success) {
                setSuccess(true);
                showSuccess('Stock refuel request sent successfully!');
                setSelectedProducts([]);
                setNotes('');
                if (onSuccess) {
                    onSuccess(response.data);
                }
            } else {
                const errorMsg = response.error || 'Failed to send stock refuel request';
                setError(errorMsg);
                showError(errorMsg);
            }
        } catch (error) {
            const errorMsg = error.message || 'An error occurred while sending the request';
            setError(errorMsg);
            showError(errorMsg);
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
            setCurrentPage(1);
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
                            <p>The supplier has been notified and will receive an email with the product list.</p>
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
                        {sizesModalOpen && selectedProductForSizes ? (
                            <div className={styles.formSection}>
                                <ProductSizesModal
                                    product={selectedProductForSizes}
                                    onClose={() => {
                                        setSizesModalOpen(false);
                                        setSelectedProductForSizes(null);
                                    }}
                                    onSave={async (productId, sizes, totalStock) => {
                                        await handleSizesModalSave(productId, sizes, totalStock);
                                        setSizesModalOpen(false);
                                        setSelectedProductForSizes(null);
                                    }}
                                    mode="edit"
                                    embedded={true}
                                    quantityOnly={true}
                                />
                            </div>
                        ) : (
                            <>
                        <div className={styles.formSection}>
                            <div className={styles.sectionHeader}>
                                <h3>Select Products to Refuel</h3>
                                <span className={styles.productCount}>
                                    {products.length} product{products.length !== 1 ? 's' : ''} found
                                </span>
                            </div>
                            <div className={styles.productList}>
                                {(() => {
                                    const startIndex = (currentPage - 1) * itemsPerPage;
                                    const endIndex = startIndex + itemsPerPage;
                                    const paginatedProducts = products.slice(startIndex, endIndex);
                                    return paginatedProducts.map(product => {
                                    const isSelected = selectedProducts.find(p => p.id === product.id);
                                    const selectedProduct = isSelected || null;
                                    
                                    return (
                                        <div 
                                            key={product.id} 
                                            className={`${styles.productItem} ${isSelected ? styles.selected : ''}`}
                                        >
                                            <div 
                                                className={styles.productCard}
                                                onClick={() => handleProductClick(product)}
                                            >
                                                <img 
                                                    src={getProductImage(product)} 
                                                    alt={product.name}
                                                    className={styles.productImage}
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                                <div className={styles.productDetails}>
                                                    <div className={styles.productName}>{product.name}</div>
                                                    <div className={styles.productCategory}>{product.category_name}</div>
                                                    <div className={styles.stockCount}>
                                                        Current stock: {product.stock_quantity}
                                                    </div>
                                                    {isSelected && (
                                                        <div className={styles.selectedBadge}>
                                                            ✓ Selected
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                    });
                                })()}
                            </div>
                            {products.length > itemsPerPage && (
                                <div className={styles.pagination}>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className={`${styles.paginationButton} ${currentPage === 1 ? styles.paginationButtonDisabled : ''}`}
                                    >
                                        Previous
                                    </button>
                                    <span className={styles.paginationInfo}>
                                        Page {currentPage} of {Math.ceil(products.length / itemsPerPage)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(products.length / itemsPerPage), prev + 1))}
                                        disabled={currentPage >= Math.ceil(products.length / itemsPerPage)}
                                        className={`${styles.paginationButton} ${currentPage >= Math.ceil(products.length / itemsPerPage) ? styles.paginationButtonDisabled : ''}`}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={styles.formSection}>
                            <div className={styles.sectionHeader}>
                                <h3>Selected Products</h3>
                                {(() => {
                                    const validProducts = getValidSelectedProducts();
                                    return validProducts.length > 0 && (
                                        <span className={styles.productCount}>
                                            {validProducts.length} selected
                                        </span>
                                    );
                                })()}
                            </div>
                            {(() => {
                                const validProducts = getValidSelectedProducts();
                                return validProducts.length === 0 ? (
                                    <div className={styles.emptySelection}>
                                        <p className={styles.noSelection}>No products selected</p>
                                        <span className={styles.emptySelectionHint}>Click on products above to select them and add sizes with quantities</span>
                                    </div>
                                ) : (
                                    <div className={styles.selectedProducts}>
                                        {validProducts.map(product => {
                                            const totalQty = getTotalQuantity(product);
                                            
                                            return (
                                                <div key={product.id} className={styles.selectedProduct}>
                                                    <div className={styles.selectedProductHeader}>
                                                        <div className={styles.selectedProductName}>{product.name}</div>
                                                        <span className={styles.selectedProductTotal}>
                                                            {totalQty} units
                                                        </span>
                                                    </div>
                                                    {product.selectedSizes && product.selectedSizes.some(s => {
                                                        const qty = parseInt(s.quantity) || 0;
                                                        return qty >= 1;
                                                    }) && (
                                                        <div className={styles.selectedProductSizes}>
                                                            {product.selectedSizes
                                                                .filter(s => {
                                                                    const qty = parseInt(s.quantity) || 0;
                                                                    return qty >= 1;
                                                                })
                                                                .map((s, index) => (
                                                                    <span key={index} className={styles.sizeQuantity}>
                                                                        Size {s.size}: {s.quantity}
                                                                    </span>
                                                                ))
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
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
                            </>
                        )}

                        {!sizesModalOpen && error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        {!sizesModalOpen && (
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
                                    disabled={loading || getValidSelectedProducts().length === 0}
                                    className={styles.primaryButton}
                                >
                                    {loading ? 'Sending...' : 'Send Refuel Request'}
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default StockRefuelModal;

