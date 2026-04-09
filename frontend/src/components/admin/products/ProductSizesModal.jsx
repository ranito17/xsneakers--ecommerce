import React, { useState, useEffect } from 'react';
import styles from './productModals.module.css';
import { calculateTotalStock, validateSizes } from '../../../utils/product.utils';
import { useSettings } from '../../../context/SettingsProvider';
import { useToast } from '../../../components/common/toast';

const ProductSizesModal = ({ 
    product, 
    onClose, 
    onSave, 
    mode = 'edit',
    embedded = false,
    quantityOnly = false
}) => {
    const { settings } = useSettings();
    const { showError, showConfirmation } = useToast();
    const [sizes, setSizes] = useState([]);
    const [originalSizes, setOriginalSizes] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const normalizedMode = (mode || 'edit').toString().toLowerCase();
    const isEditMode = normalizedMode === 'edit';
    
    const lowStockThreshold = settings?.low_stock_threshold || 10;
    const lowStockPerSizeThreshold = settings?.low_stock_threshold_per_size || 5;
    const getStockStatus = (quantity, threshold) => {
        if (quantity === 0) return 'out-of-stock';
        if (quantity <= threshold) return 'low-stock';
        return 'in-stock';
    };

    const getStockStatusLabel = (status) => {
        switch (status) {
            case 'in-stock':
                return '✓ In Stock';
            case 'low-stock':
                return '⚠ Low Stock';
            case 'out-of-stock':
                return '✕ Out of Stock';
            default:
                return '';
        }
    };

    useEffect(() => {
        if (product && product.sizes) {
            let sizesData = product.sizes;
            
            // Parse if string
            if (typeof sizesData === 'string') {
                try {
                    sizesData = JSON.parse(sizesData);
                } catch (e) {
                    sizesData = [];
                }
            }
            
            // Ensure it's array of objects
            if (Array.isArray(sizesData)) {
                const mappedSizes = sizesData.map(s => ({
                    size: s.size || s,
                    currentQuantity: parseInt(s.quantity) || 0, // Current stock quantity
                    quantity: quantityOnly ? 0 : (parseInt(s.quantity) || 0) // Quantity to order (starts at 0 for refuel)
                }));
                setSizes(mappedSizes);
                // Store original sizes to prevent changing existing size values
                setOriginalSizes(mappedSizes.map(s => ({ size: s.size, quantity: s.currentQuantity })));
            }
        }
    }, [product]);

    const handleSizeChange = (index, field, value) => {
        if (!isEditMode) {
            return;
        }
        
        // If quantityOnly mode, only allow changing quantity (not currentQuantity or size)
        if (quantityOnly && (field === 'size' || field === 'currentQuantity')) {
            return;
        }
        
        // Prevent changing size value for existing sizes (can only change quantity)
        if (field === 'size' && originalSizes.length > 0 && !quantityOnly) {
            const currentSize = sizes[index];
            const currentSizeValue = currentSize.size ? parseFloat(currentSize.size) : null;
            // Check if this size number exists in original sizes
            const isExistingSize = currentSizeValue !== null && 
                originalSizes.some(os => parseFloat(os.size) == currentSizeValue);
            if (isExistingSize) {
                // This is an existing size - don't allow changing the size value
                showError('Cannot change existing size. You can only modify quantity or add new sizes.');
                return;
            }
        }
        
        setSizes(prev => prev.map((size, i) => 
            i === index ? { 
                ...size, 
                [field]: field === 'quantity' 
                    ? Math.max(0, parseInt(value) || 0)
                    : value 
            } : size
        ));
        setHasChanges(true);
    };

    const addSize = () => {
        setSizes(prev => [...prev, { size: '', quantity: 0 }]);
        setHasChanges(true);
    };

    const removeSize = async (index) => {
        const sizeToRemove = sizes[index];
        const sizeValue = sizeToRemove?.size || 'this size';
        const confirmed = await showConfirmation(`Are you sure you want to delete size ${sizeValue}?`);
        if (confirmed) {
            setSizes(prev => prev.filter((_, i) => i !== index));
            setHasChanges(true);
        }
    };

    const handleSave = async () => {
        // Filter out empty sizes
        const validSizes = sizes.filter(s => s.size && s.size.toString().trim() !== '');
        
        // For quantityOnly mode, only send sizes with quantity > 0 (filter out 0 quantities)
        const sizesToSave = quantityOnly 
            ? validSizes.filter(s => {
                const qty = parseInt(s.quantity) || 0;
                return qty > 0; // Only include sizes with quantity > 0
            }).map(s => ({
                size: s.size,
                quantity: parseInt(s.quantity) || 0
            }))
            : validSizes.map(s => ({
                size: s.size,
                quantity: parseInt(s.quantity) || 0
            }));
        
        // Validate sizes for duplicates
        const sizeValidation = validateSizes(sizesToSave, originalSizes);
        if (!sizeValidation.isValid) {
            showError(sizeValidation.errors.join('; '));
            return;
        }
        
        // Calculate total stock (use currentQuantity if available, otherwise quantity)
        const totalStock = quantityOnly 
            ? sizesToSave.reduce((total, s) => total + (parseInt(s.quantity) || 0), 0)
            : calculateTotalStock(sizesToSave);
        
        await onSave(product.id, sizesToSave, totalStock);
        if (!embedded) {
            onClose();
        }
    };

    const totalStock = calculateTotalStock(sizes);

    const modalContent = (
        <>
                <div className={styles.modalHeader}>
                    <h2>{isEditMode ? (quantityOnly ? 'Select Quantities' : 'Manage Sizes') : 'View Sizes'} - {product?.name}</h2>
                    <div className={styles.headerActions}>
                        {!embedded && (
                            <button onClick={onClose} className={styles.closeButton}>×</button>
                        )}
                    </div>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.stockSummary}>
                        <div className={styles.totalStockInfo}>
                            <h3>Total Stock: <span className={styles.stockValue}>{totalStock} units</span></h3>
                            <span className={`${styles.stockStatusBadge} ${styles[getStockStatus(totalStock, lowStockThreshold)]}`}>
                                {getStockStatusLabel(getStockStatus(totalStock, lowStockThreshold))}
                            </span>
                        </div>
                        <p className={styles.sizeCount}>Number of Sizes: <span>{sizes.length}</span></p>
                        {isEditMode && !sizes.every(s => s.size) && (
                            <p className={styles.warning}>⚠️ Some sizes are missing size values</p>
                        )}
                    </div>

                    <div className={styles.sizesContainer}>
                        <div className={`${styles.sizesHeader} ${quantityOnly ? styles.sizesHeaderWithCurrentStock : ''}`}>
                            <span>Size</span>
                            {quantityOnly && <span>Current Stock</span>}
                            <span>{quantityOnly ? 'Quantity to Order' : 'Quantity'}</span>
                            <span>Stock Status</span>
                            {isEditMode && !quantityOnly && <span>Actions</span>}
                        </div>

                        {sizes.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No sizes added yet</p>
                                {isEditMode && (
                                    <button onClick={addSize} className={styles.addButton}>
                                        + Add First Size
                                    </button>
                                )}
                            </div>
                        ) : (
                            sizes.map((size, index) => {
                                const currentQty = size.currentQuantity !== undefined ? size.currentQuantity : size.quantity;
                                const sizeStatus = getStockStatus(currentQty, lowStockPerSizeThreshold);
                                const sizeValue = size.size ? parseFloat(size.size) : null;
                                const isExistingSize = sizeValue !== null && sizeValue !== '' && 
                                    originalSizes.some(os => parseFloat(os.size) == sizeValue);
                                const isNewSize = !size.size || size.size === '' || !isExistingSize;
                                return (
                                    <div key={index} className={`${styles.sizeRow} ${quantityOnly ? styles.sizeRowWithCurrentStock : ''}`}>
                                        {isEditMode ? (
                                            <>
                                                {quantityOnly ? (
                                                    <>
                                                        <span className={styles.sizeDisplay}>{size.size}</span>
                                                        <span className={styles.currentQuantityDisplay}>
                                                            {currentQty}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={size.size}
                                                        onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                                                        placeholder="e.g., 7, 8, M, L"
                                                        className={styles.sizeInput}
                                                        readOnly={!isNewSize}
                                                        disabled={!isNewSize}
                                                        title={!isNewSize ? 'Cannot change existing size. You can only modify quantity or add new sizes.' : 'Enter size number'}
                                                    />
                                                )}
                                                <input
                                                    type="number"
                                                    value={size.quantity}
                                                    onChange={(e) => handleSizeChange(index, 'quantity', e.target.value)}
                                                    min="0"
                                                    className={styles.quantityInput}
                                                    placeholder={quantityOnly ? "Enter quantity to order" : ""}
                                                    readOnly={!isEditMode}
                                                    disabled={!isEditMode}
                                                />
                                                <span className={`${styles.stockStatusBadge} ${styles[sizeStatus]}`}>
                                                    {getStockStatusLabel(sizeStatus)}
                                                </span>
                                                {!quantityOnly && (
                                                    <button
                                                        onClick={() => removeSize(index)}
                                                        className={styles.removeButton}
                                                        title="Remove size"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <span className={styles.sizeDisplay}>{size.size}</span>
                                                {quantityOnly && (
                                                    <span className={styles.currentQuantityDisplay}>
                                                        {currentQty}
                                                    </span>
                                                )}
                                                <span className={styles.quantityDisplay}>{size.quantity}</span>
                                                <span className={`${styles.stockStatusBadge} ${styles[sizeStatus]}`}>
                                                    {getStockStatusLabel(sizeStatus)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                );
                            })
                        )}

                        {sizes.length > 0 && isEditMode && !quantityOnly && (
                            <button onClick={addSize} className={styles.addButtonSmall}>
                                + Add Another Size
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.cancelButton}>
                        {isEditMode ? 'Cancel' : 'Close'}
                    </button>
                    {isEditMode && (
                        <button 
                            onClick={handleSave} 
                            className={styles.saveButton}
                            disabled={!hasChanges || (quantityOnly ? sizes.filter(s => (parseInt(s.quantity) || 0) > 0).length === 0 : sizes.some(s => !s.size))}
                        >
                            {quantityOnly ? 'Confirm Selection' : 'Save Changes'}
                        </button>
                    )}
                </div>
        </>
    );

    if (embedded) {
        return <div className={styles.embeddedModal}>{modalContent}</div>;
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {modalContent}
            </div>
        </div>
    );
};

export default ProductSizesModal;

