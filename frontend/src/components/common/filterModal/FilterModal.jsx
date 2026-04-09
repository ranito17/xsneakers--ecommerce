import React, { useState, useEffect } from 'react';
import DualRangeSlider from './DualRangeSlider';
import { validatePriceRange, validateSizeRange } from '../../../utils/product.utils';
import styles from './filterModal.module.css';

const FilterModal = ({ 
    isOpen, 
    onClose, 
    onApplyFilter, 
    initialFilters = null,
    priceRange = { min: 0, max: 1000 },
    sizeRange = { min: 3, max: 15 }
}) => {
    const [filters, setFilters] = useState({
        priceRange: { min: priceRange.min, max: priceRange.max },
        sizeRange: { min: sizeRange.min, max: sizeRange.max },
        sortBy: ''
    });

    const [errors, setErrors] = useState({
        priceRange: '',
        sizeRange: ''
    });

    // Initialize filters when modal opens or ranges change
    useEffect(() => {
        if (isOpen) {
            if (initialFilters) {
                setFilters(initialFilters);
            } else {
                setFilters({
                    priceRange: { min: priceRange.min, max: priceRange.max },
                    sizeRange: { min: sizeRange.min, max: sizeRange.max },
                    sortBy: ''
                });
            }
            setErrors({ priceRange: '', sizeRange: '' });
        }
    }, [isOpen, initialFilters, priceRange, sizeRange]);

    // Handle price range change
    const handlePriceRangeChange = (range) => {
        setFilters(prev => ({
            ...prev,
            priceRange: range
        }));
        
        // Validate price range
        const validation = validatePriceRange(range.min, range.max);
        setErrors(prev => ({
            ...prev,
            priceRange: validation.isValid ? '' : validation.error
        }));
    };

    // Handle size range change
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

    // Handle sort change
    const handleSortChange = (sortBy) => {
        setFilters(prev => ({
            ...prev,
            sortBy
        }));
    };

    // Validate all filters before applying
    const validateFilters = () => {
        const priceValidation = validatePriceRange(filters.priceRange.min, filters.priceRange.max);
        const sizeValidation = validateSizeRange(filters.sizeRange.min, filters.sizeRange.max);
        
        setErrors({
            priceRange: priceValidation.isValid ? '' : priceValidation.error,
            sizeRange: sizeValidation.isValid ? '' : sizeValidation.error
        });
        
        return priceValidation.isValid && sizeValidation.isValid;
    };

    const handleApplyFilter = () => {
        if (validateFilters()) {
            onApplyFilter(filters);
            onClose();
        }
    };

    const handleClearFilter = () => {
        const clearedFilters = {
            priceRange: { min: priceRange.min, max: priceRange.max },
            sizeRange: { min: sizeRange.min, max: sizeRange.max },
            sortBy: ''
        };
        setFilters(clearedFilters);
        setErrors({ priceRange: '', sizeRange: '' });
        onApplyFilter(null);
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    // Check if filters are active (different from defaults)
    const hasActiveFilters = () => {
        return filters.priceRange.min !== priceRange.min ||
               filters.priceRange.max !== priceRange.max ||
               filters.sizeRange.min !== sizeRange.min ||
               filters.sizeRange.max !== sizeRange.max ||
               filters.sortBy !== '';
    };

    // Check if any filters have changed from initial values
    const hasFiltersChanged = () => {
        if (!initialFilters) {
            // No initial filters, check if different from defaults
            return hasActiveFilters();
        }
        
        // Compare with initial filters
        return filters.priceRange.min !== initialFilters.priceRange.min ||
               filters.priceRange.max !== initialFilters.priceRange.max ||
               filters.sizeRange.min !== initialFilters.sizeRange.min ||
               filters.sizeRange.max !== initialFilters.sizeRange.max ||
               filters.sortBy !== initialFilters.sortBy;
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
                    {/* Price Range Filter */}
                    <div className={styles.filterSection}>
                        <h3>Price Range</h3>
                        <DualRangeSlider
                            min={priceRange.min}
                            max={priceRange.max}
                            step={1}
                            minValue={filters.priceRange.min}
                            maxValue={filters.priceRange.max}
                            onChange={handlePriceRangeChange}
                            formatValue={(value) => `$${value}`}
                        />
                        {errors.priceRange && (
                            <div className={styles.errorMessage}>{errors.priceRange}</div>
                        )}
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
                                    value=""
                                    checked={filters.sortBy === ''}
                                    onChange={() => handleSortChange('')}
                                />
                                <span className={styles.radioLabel}>
                                    <svg className={styles.radioIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 4h18M3 12h18M3 20h18"/>
                                    </svg>
                                    Default (Name A-Z)
                                </span>
                            </label>

                            <label className={styles.sortOption}>
                                <input
                                    type="radio"
                                    name="sortBy"
                                    value="newest"
                                    checked={filters.sortBy === 'newest'}
                                    onChange={() => handleSortChange('newest')}
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
                                    onChange={() => handleSortChange('oldest')}
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
                                    value="price-low"
                                    checked={filters.sortBy === 'price-low'}
                                    onChange={() => handleSortChange('price-low')}
                                />
                                <span className={styles.radioLabel}>
                                    <svg className={styles.radioIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <polyline points="5 12 12 19 19 12"/>
                                    </svg>
                                    Price: Low to High
                                </span>
                            </label>

                            <label className={styles.sortOption}>
                                <input
                                    type="radio"
                                    name="sortBy"
                                    value="price-high"
                                    checked={filters.sortBy === 'price-high'}
                                    onChange={() => handleSortChange('price-high')}
                                />
                                <span className={styles.radioLabel}>
                                    <svg className={styles.radioIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="19" x2="12" y2="5"/>
                                        <polyline points="5 12 12 5 19 12"/>
                                    </svg>
                                    Price: High to Low
                                </span>
                            </label>

                            <label className={styles.sortOption}>
                                <input
                                    type="radio"
                                    name="sortBy"
                                    value="best-sellers"
                                    checked={filters.sortBy === 'best-sellers'}
                                    onChange={() => handleSortChange('best-sellers')}
                                />
                                <span className={styles.radioLabel}>
                                    <svg className={styles.radioIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                    Best Sellers
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {hasActiveFilters() && (
                        <div className={styles.filterPreview}>
                            <h3>Active Filters</h3>
                            <div className={styles.activeFilters}>
                                {(filters.priceRange.min !== priceRange.min || filters.priceRange.max !== priceRange.max) && (
                                    <span className={styles.filterTag}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="1" x2="12" y2="23"/>
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                        </svg>
                                        ${filters.priceRange.min} - ${filters.priceRange.max}
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
                                {filters.sortBy && (
                                    <span className={styles.filterTag}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                                            <polyline points="2 17 12 22 22 17"/>
                                            <polyline points="2 12 12 17 22 12"/>
                                        </svg>
                                        {filters.sortBy === 'newest' && 'Newest First'}
                                        {filters.sortBy === 'oldest' && 'Oldest First'}
                                        {filters.sortBy === 'price-low' && 'Price: Low to High'}
                                        {filters.sortBy === 'price-high' && 'Price: High to Low'}
                                        {filters.sortBy === 'best-sellers' && 'Best Sellers'}
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
                            disabled={!!errors.priceRange || !!errors.sizeRange || !hasFiltersChanged()}
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

export default FilterModal;
