import React, { useState } from 'react';
import styles from './dashboard.module.css';

const SizeQuantitySelector = ({ 
    productId, 
    availableSizes, 
    selectedSizes, 
    onSizeSelection, 
    onQuantityChange 
}) => {
    const [selectedSize, setSelectedSize] = useState('');

    const handleSizeSelect = (e) => {
        const size = e.target.value;
        setSelectedSize(size);
        
        // Automatically add the size when selected
        if (size && !selectedSizes.some(s => s.size === size)) {
            onSizeSelection(productId, size, true);
            setSelectedSize(''); // Reset dropdown after adding
        }
    };

    const updateQuantity = (size, quantity) => {
        // Ensure quantity is at least 1
        const qty = Math.max(1, parseInt(quantity) || 1);
        onQuantityChange(productId, size, qty);
    };

    const getTotalQuantity = () => {
        return selectedSizes.reduce((total, s) => total + (s.quantity || 0), 0);
    };

    const getSizeQuantity = (size) => {
        const selectedSize = selectedSizes.find(s => s.size === size);
        return selectedSize ? selectedSize.quantity : 0;
    };

    return (
        <div className={styles.sizeQuantities} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.sizeQuantitiesTitle}>
                Select sizes and quantities:
            </h4>
            
            {/* Size Dropdown - automatically adds on selection */}
            <div className={styles.sizeDropdownSection}>
                <select 
                    value={selectedSize} 
                    onChange={handleSizeSelect}
                    className={styles.sizeDropdown}
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value="">Select Size</option>
                    {availableSizes.map((sizeInfo, index) => {
                        const isAlreadySelected = selectedSizes.some(s => s.size === sizeInfo.size);
                        return (
                            <option 
                                key={index} 
                                value={sizeInfo.size}
                                disabled={isAlreadySelected}
                            >
                                Size {sizeInfo.size} (Current: {sizeInfo.currentStock})
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Selected Sizes with Quantities */}
            {selectedSizes.length > 0 && (
                <div className={styles.selectedSizesSection}>
                    <h5 className={styles.selectedSizesTitle}>
                        Selected sizes and quantities:
                    </h5>
                    
                    <div className={styles.selectedSizesList}>
                        {selectedSizes.map((sizeData, index) => (
                            <div key={index} className={styles.selectedSizeItem}>
                                <div className={styles.sizeInfo}>
                                    <span className={styles.sizeLabel}>Size {sizeData.size}</span>
                                </div>
                                
                                <div className={styles.quantitySection}>
                                    <label>Quantity needed:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={getSizeQuantity(sizeData.size) || 1}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || parseInt(val) >= 1) {
                                                updateQuantity(sizeData.size, val || 1);
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className={styles.quantityField}
                                        placeholder="1"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className={styles.totalQuantity}>
                Total: {getTotalQuantity()} units
            </div>
        </div>
    );
};

export default SizeQuantitySelector;
