import React, { useState, useEffect } from 'react';
import DualRangeSlider from '../../../common/filterModal/DualRangeSlider';
import { validateSizeRange } from '../../../../utils/product.utils';
import styles from './adminFilterModal.module.css';

const AdminFilterModal = ({ 
    isOpen, 
    onClose, 
    onApplyFilter, 
    initialFilters = null,
    categories = [],
    sizeRange = { min: 3, max: 15 }
}) => {
    const [filters, setFilters] = useState({
        category_id: 'all',
        stockStatus: 'all', // 'all', 'in-stock', 'out-of-stock'
        sizeRange: { min: sizeRange.min, max: sizeRange.max },
        sortBy: 'newest' // 'newest', 'oldest', 'name'
    });

    const [errors, setErrors] = useState({
        sizeRange: ''
    });

    // Initialize filters when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialFilters) {
                    setFilters({
                        category_id: initialFilters.category_id || 'all',
                        stockStatus: initialFilters.stockStatus || 'all',
                        sizeRange: initialFilters.sizeRange || { min: sizeRange.min, max: sizeRange.max },
                        sortBy: initialFilters.sortBy || 'newest'
                    });
            } else {
                setFilters({
                    category_id: 'all',
                    stockStatus: 'all',
                    sizeRange: { min: sizeRange.min, max: sizeRange.max },
                    sortBy: 'newest'
                });
            }
            setErrors({ sizeRange: '' });
        }
    }, [isOpen, initialFilters, sizeRange]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSizeRangeChange = (range) => {
        setFilters(prev => ({
            ...prev,
            sizeRange: range
        }));
        
        // Validate size range
        const validation = validateSizeRange(range.min, range.max);
        setErrors(prev => ({
            ...prev,
            sizeRange: validation.isValid ? '' : validation.error
        }));
    };

    const handleApplyFilter = () => {
        onApplyFilter(filters);
        onClose();
    };

    const handleClearFilter = () => {
        const clearedFilters = {
            category_id: 'all',
            stockStatus: 'all',
            sizeRange: { min: sizeRange.min, max: sizeRange.max },
            sortBy: 'newest'
        };
        setFilters(clearedFilters);
        setErrors({ sizeRange: '' });
        onApplyFilter(null);
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    // Check if filters are active (different from defaults)
    const hasActiveFilters = () => {
        return filters.category_id !== 'all' ||
               filters.stockStatus !== 'all' ||
               filters.sizeRange.min !== sizeRange.min ||
               filters.sizeRange.max !== sizeRange.max ||
               filters.sortBy !== 'newest';
    };

    // Check if any filters have changed from initial values
    const hasFiltersChanged = () => {
        if (!initialFilters) {
            return hasActiveFilters();
        }
        
        const initialSizeRange = initialFilters?.sizeRange || { min: sizeRange.min, max: sizeRange.max };
        return filters.category_id !== (initialFilters?.category_id || 'all') ||
               filters.stockStatus !== (initialFilters?.stockStatus || 'all') ||
               filters.sizeRange.min !== initialSizeRange.min ||
               filters.sizeRange.max !== initialSizeRange.max ||
               filters.sortBy !== (initialFilters?.sortBy || 'newest');
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Filter & Sort Products</h2>
                    <button className={styles.closeButton} onClick={handleClose} aria-label="Close modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div className={styles.modalContent}>
                    {/* Category Filter */}
                    <div className={styles.filterSection}>
                        <h3>Category</h3>
                        <div className={styles.filterField}>
                            <select
                                name="category_id"
                                value={filters.category_id}
                                onChange={handleChange}
                                className={styles.filterSelect}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Stock Status Filter */}
                    <div className={styles.filterSection}>
                        <h3>Stock Status</h3>
                        <div className={styles.filterField}>
                            <select
                                name="stockStatus"
                                value={filters.stockStatus}
                                onChange={handleChange}
                                className={styles.filterSelect}
                            >
                                <option value="all">All Products</option>
                                <option value="in-stock">In Stock</option>
                                <option value="out-of-stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>

                    {/* Size Range Filter */}
                    <div className={styles.filterSection}>
                        <h3>Size Range</h3>
                        <DualRangeSlider
                            min={sizeRange.min}
                            max={sizeRange.max}
                            step={0.5}
                            minValue={filters.sizeRange.min}
                            maxValue={filters.sizeRange.max}
                            onChange={handleSizeRangeChange}
                            formatValue={(value) => `US ${value}`}
                        />
                        {errors.sizeRange && (
                            <div className={styles.errorMessage}>{errors.sizeRange}</div>
                        )}
                    </div>

                    {/* Sort Options */}
                    <div className={styles.filterSection}>
                        <h3>Sort By</h3>
                        <div className={styles.sortOptions}>
                            <label className={styles.sortOption}>
                                <input
                                    type="radio"
                                    name="sortBy"
                                    value="newest"
                                    checked={filters.sortBy === 'newest'}
                                    onChange={() => handleChange({ target: { name: 'sortBy', value: 'newest' } })}
                                />
                                <span className={styles.radioLabel}>
                                    <svg className={styles.radioIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    Newest First
                                </span>
                            </label>

                            <label className={styles.sortOption}>
                                <input
                                    type="radio"
                                    name="sortBy"
                                    value="oldest"
                                    checked={filters.sortBy === 'oldest'}
                                    onChange={() => handleChange({ target: { name: 'sortBy', value: 'oldest' } })}
                                />
                                <span className={styles.radioLabel}>
                                    <svg className={styles.radioIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 8 14"/>
                                    </svg>
                                    Oldest First
                                </span>
                            </label>

                            <label className={styles.sortOption}>
                                <input
                                    type="radio"
                                    name="sortBy"
                                    value="name"
                                    checked={filters.sortBy === 'name'}
                                    onChange={() => handleChange({ target: { name: 'sortBy', value: 'name' } })}
                                />
                                <span className={styles.radioLabel}>
                                    <svg className={styles.radioIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 4h18M3 12h18M3 20h18"/>
                                    </svg>
                                    Name (A-Z)
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {hasActiveFilters() && (
                        <div className={styles.filterPreview}>
                            <h3>Active Filters</h3>
                            <div className={styles.activeFilters}>
                                {filters.category_id && filters.category_id !== 'all' && (
                                    <span className={styles.filterTag}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 7h16M4 12h16M4 17h16"/>
                                        </svg>
                                        {categories.find(c => c.category_id === parseInt(filters.category_id))?.category_name || 'Category'}
                                    </span>
                                )}
                                {filters.stockStatus !== 'all' && (
                                    <span className={styles.filterTag}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                        </svg>
                                        {filters.stockStatus === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                )}
                                {(filters.sizeRange.min !== sizeRange.min || filters.sizeRange.max !== sizeRange.max) && (
                                    <span className={styles.filterTag}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                                        </svg>
                                        US {filters.sizeRange.min} - {filters.sizeRange.max}
                                    </span>
                                )}
                                {filters.sortBy && filters.sortBy !== 'newest' && (
                                    <span className={styles.filterTag}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                                            <polyline points="2 17 12 22 22 17"/>
                                            <polyline points="2 12 12 17 22 12"/>
                                        </svg>
                                        {filters.sortBy === 'oldest' && 'Oldest First'}
                                        {filters.sortBy === 'name' && 'Name (A-Z)'}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.modalActions}>
                    <button 
                        className={styles.clearButton}
                        onClick={handleClearFilter}
                        disabled={!hasActiveFilters()}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Clear All
                    </button>
                    <div className={styles.actionButtons}>
                        <button 
                            className={styles.cancelButton}
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button 
                            className={styles.applyButton}
                            onClick={handleApplyFilter}
                            disabled={!!errors.sizeRange || !hasFiltersChanged()}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFilterModal;

