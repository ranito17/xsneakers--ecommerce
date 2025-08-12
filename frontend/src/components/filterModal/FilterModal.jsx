import React, { useState, useEffect } from 'react';
import styles from './filterModal.module.css';

const FilterModal = ({ isOpen, onClose, onApplyFilter, initialFilters = null }) => {
    const [filterCriteria, setFilterCriteria] = useState({
        color: '',
        filters: []
    });

    // Initialize filters when modal opens
    useEffect(() => {
        if (isOpen && initialFilters) {
            setFilterCriteria(initialFilters);
        } else if (isOpen) {
            setFilterCriteria({
                color: '',
                filters: []
            });
        }
    }, [isOpen, initialFilters]);

    const [newFilter, setNewFilter] = useState({
        field: '',
        operator: '',
        value: '',
        value2: '' // For range filters
    });

    const handleFilterChange = (field, value) => {
        setFilterCriteria(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNewFilterChange = (field, value) => {
        setNewFilter(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addFilter = () => {
        if (newFilter.field && newFilter.operator && newFilter.value) {
            setFilterCriteria(prev => ({
                ...prev,
                filters: [...prev.filters, { ...newFilter }]
            }));
            setNewFilter({
                field: '',
                operator: '',
                value: '',
                value2: ''
            });
        }
    };

    const removeFilter = (index) => {
        setFilterCriteria(prev => ({
            ...prev,
            filters: prev.filters.filter((_, i) => i !== index)
        }));
    };

    const handleApplyFilter = () => {
        onApplyFilter(filterCriteria);
        onClose();
    };

    const handleClearFilter = () => {
        setFilterCriteria({
            color: '',
            filters: []
        });
        onApplyFilter(null);
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Filter Products</h2>
                    <button className={styles.closeButton} onClick={handleClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div className={styles.modalContent}>
                    <div className={styles.filterSection}>
                        <h3>Basic Filters</h3>
                        
                        {/* Color Filter */}
                        <div className={styles.filterField}>
                            <label>Color:</label>
                            <input
                                type="text"
                                placeholder="Filter by color..."
                                value={filterCriteria.color}
                                onChange={(e) => handleFilterChange('color', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <h3>Advanced Filters</h3>
                        
                        {/* Add New Filter */}
                        <div className={styles.addFilterSection}>
                            <h4>Add New Filter</h4>
                            
                            <div className={styles.filterRow}>
                                <div className={styles.filterField}>
                                    <label>Field:</label>
                                    <select
                                        value={newFilter.field}
                                        onChange={(e) => handleNewFilterChange('field', e.target.value)}
                                    >
                                        <option value="">Select field</option>
                                        <option value="price">Price</option>
                                        <option value="stock_quantity">Stock Quantity</option>
                                        <option value="sizes">Sizes</option>
                                    </select>
                                </div>

                                <div className={styles.filterField}>
                                    <label>Operator:</label>
                                    <select
                                        value={newFilter.operator}
                                        onChange={(e) => handleNewFilterChange('operator', e.target.value)}
                                    >
                                        <option value="">Select operator</option>
                                        <option value="gte">Greater than or equal (≥)</option>
                                        <option value="lte">Less than or equal (≤)</option>
                                        <option value="eq">Equal (=)</option>
                                        <option value="range">Range (between)</option>
                                    </select>
                                </div>

                                {newFilter.operator === 'range' ? (
                                    <div className={styles.rangeInputs}>
                                        <div className={styles.filterField}>
                                            <label>Value:</label>
                                            <input
                                                type="number"
                                                placeholder="Enter value..."
                                                value={newFilter.value}
                                                onChange={(e) => handleNewFilterChange('value', e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.filterField}>
                                            <label>To:</label>
                                            <input
                                                type="number"
                                                placeholder="Enter second value..."
                                                value={newFilter.value2}
                                                onChange={(e) => handleNewFilterChange('value2', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.filterField}>
                                        <label>Value:</label>
                                        <input
                                            type="number"
                                            placeholder="Enter value..."
                                            value={newFilter.value}
                                            onChange={(e) => handleNewFilterChange('value', e.target.value)}
                                        />
                                    </div>
                                )}

                                <button 
                                    className={styles.addFilterButton}
                                    onClick={addFilter}
                                    disabled={!newFilter.field || !newFilter.operator || !newFilter.value}
                                >
                                    Add Filter
                                </button>
                            </div>
                        </div>

                        {/* Active Filters List */}
                        {filterCriteria.filters.length > 0 && (
                            <div className={styles.activeFiltersSection}>
                                <h4>Active Filters</h4>
                                <div className={styles.activeFiltersList}>
                                    {filterCriteria.filters.map((filter, index) => (
                                        <div key={index} className={styles.activeFilterItem}>
                                            <span className={styles.filterText}>
                                                {filter.field}: {filter.operator} {filter.value}
                                                {filter.operator === 'range' && filter.value2 && ` - ${filter.value2}`}
                                            </span>
                                            <button 
                                                className={styles.removeFilterButton}
                                                onClick={() => removeFilter(index)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.filterPreview}>
                        <h3>All Active Filters</h3>
                        <div className={styles.activeFilters}>
                            {filterCriteria.color && (
                                <span className={styles.filterTag}>
                                    Color: {filterCriteria.color}
                                    <button onClick={() => handleFilterChange('color', '')}>×</button>
                                </span>
                            )}
                            {filterCriteria.filters.map((filter, index) => (
                                <span key={index} className={styles.filterTag}>
                                    {filter.field}: {filter.operator} {filter.value}
                                    {filter.operator === 'range' && filter.value2 && ` - ${filter.value2}`}
                                    <button onClick={() => removeFilter(index)}>×</button>
                                </span>
                            ))}
                            {!filterCriteria.color && filterCriteria.filters.length === 0 && (
                                <span className={styles.noFilters}>No active filters</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button 
                        className={styles.clearButton}
                        onClick={handleClearFilter}
                    >
                        Clear All Filters
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
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
