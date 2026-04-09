import React, { useState, useEffect } from 'react';
import DualRangeSlider from '../../../common/filterModal/DualRangeSlider';
import Calendar from '../../analytics/dateRangePicker/Calendar';
import { useSettings } from '../../../../context/SettingsProvider';
import { validatePriceRange } from '../../../../utils/product.utils';
import { getOrderPriceRange, getOrderQuantityRange } from '../../../../utils/order.utils';
import { formatPrice, validatePrice } from '../../../../utils/price.utils';
import { validateDateRange, isValidDate } from '../../../../utils/date.utils';
import styles from './orderFilterModal.module.css';

const OrderFilterModal = ({ 
    isOpen, 
    onClose, 
    onApplyFilters,
    availableSizes = [],
    allProducts = [],
    orders = [],
    orderItems = {}
}) => {
    // Get currency from settings
    const { settings } = useSettings();
    const currency = settings?.currency || 'ILS';
    
    // Calculate price and quantity ranges from orders
    const orderPriceRange = getOrderPriceRange(orders);
    const quantityRange = getOrderQuantityRange(orderItems);
    
    const [filters, setFilters] = useState({
        status: 'all',
        sizes: [],
        priceRange: { min: orderPriceRange.min, max: orderPriceRange.max },
        productSearch: '',
        startDate: '',
        endDate: '',
        quantityRange: { min: quantityRange.min, max: quantityRange.max },
        sortBy: 'newest' // 'newest', 'oldest', 'priceHigh', or 'priceLow'
    });
    
    const [calendarConfig, setCalendarConfig] = useState(null);
    const [priceRangeError, setPriceRangeError] = useState('');
    const [quantityRangeError, setQuantityRangeError] = useState('');
    const [dateRangeError, setDateRangeError] = useState('');

    // Initialize filters when modal opens or orders change
    useEffect(() => {
        if (isOpen) {
            const newPriceRange = getOrderPriceRange(orders);
            const newQuantityRange = getOrderQuantityRange(orderItems);
            setFilters(prev => ({
                ...prev,
                priceRange: prev.priceRange?.min === orderPriceRange.min && prev.priceRange?.max === orderPriceRange.max 
                    ? prev.priceRange 
                    : { min: newPriceRange.min, max: newPriceRange.max },
                quantityRange: prev.quantityRange?.min === quantityRange.min && prev.quantityRange?.max === quantityRange.max
                    ? prev.quantityRange
                    : { min: newQuantityRange.min, max: newQuantityRange.max }
            }));
        }
    }, [isOpen, orders, orderItems]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSizeToggle = (size) => {
        setFilters(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };

    // Handle price range change
    const handlePriceRangeChange = (range) => {
        setFilters(prev => ({
            ...prev,
            priceRange: range
        }));
        
        // Validate price range
        const validation = validatePriceRange(range.min, range.max);
        setPriceRangeError(validation.isValid ? '' : validation.error);
    };

    // Handle quantity range change
    const handleQuantityRangeChange = (range) => {
        setFilters(prev => ({
            ...prev,
            quantityRange: range
        }));
        
        // Validate quantity range
        if (range.min > range.max) {
            setQuantityRangeError('Min quantity cannot be greater than max quantity');
        } else if (range.min < quantityRange.min || range.max > quantityRange.max) {
            setQuantityRangeError('Quantity range must be within available range');
        } else {
            setQuantityRangeError('');
        }
    };

    // Handle date input change
    const handleDateInputChange = (e) => {
        const { name, value } = e.target;
        const newDate = value || '';
        
        setFilters(prev => {
            const newFilters = {
                ...prev,
                [name]: newDate
            };
            
            // Validate date range if both dates are set
            if ((name === 'startDate' || name === 'endDate') && (newFilters.startDate || newFilters.endDate)) {
                const validation = validateDateRange(newFilters.startDate, newFilters.endDate);
                setDateRangeError(validation.isValid ? '' : validation.error);
            } else {
                setDateRangeError('');
            }
            
            return newFilters;
        });
    };

    // Handle opening calendar modal for start date
    const handleOpenStartCalendar = () => {
        const currentStartDate = filters?.startDate || '';
        const currentEndDate = filters?.endDate || '';
        setCalendarConfig({
            type: 'start',
            selectedDate: currentStartDate || null,
            onDateSelect: (date) => handleDateSelect(date, 'startDate'),
            maxDate: currentEndDate || new Date().toISOString().split('T')[0]
        });
    };

    // Handle opening calendar modal for end date
    const handleOpenEndCalendar = () => {
        const currentStartDate = filters?.startDate || '';
        const currentEndDate = filters?.endDate || '';
        setCalendarConfig({
            type: 'end',
            selectedDate: currentEndDate || null,
            onDateSelect: (date) => handleDateSelect(date, 'endDate'),
            minDate: currentStartDate || null,
            maxDate: new Date().toISOString().split('T')[0]
        });
    };

    // Handle closing calendar modal
    const handleCloseCalendar = () => {
        setCalendarConfig(null);
    };

    // Safe date select handler that closes calendar
    const handleDateSelect = (date, name) => {
        if (date) {
            handleDateInputChange({ target: { name, value: date } });
        }
        handleCloseCalendar();
    };

    const handleApply = () => {
        // Get current available ranges (they might have changed)
        const currentPriceRange = getOrderPriceRange(orders);
        const currentQuantityRange = getOrderQuantityRange(orderItems);
        
        // Validate price range
        const priceValidation = validatePriceRange(filters.priceRange.min, filters.priceRange.max);
        if (!priceValidation.isValid) {
            setPriceRangeError(priceValidation.error);
            return; // Don't apply if price range is invalid
        }
        
        // Validate date range if dates are provided
        if (filters.startDate || filters.endDate) {
            const dateValidation = validateDateRange(filters.startDate, filters.endDate);
            if (!dateValidation.isValid) {
                setDateRangeError(dateValidation.error);
                return; // Don't apply if date range is invalid
            }
        }
        
        // Validate quantity range
        if (filters.quantityRange.min > filters.quantityRange.max) {
            setQuantityRangeError('Min quantity cannot be greater than max quantity');
            return; // Don't apply if quantity range is invalid
        }
        
        // Convert filters to format expected by parent
        const appliedFilters = {
            status: filters.status,
            sizes: filters.sizes,
            minTotal: filters.priceRange.min === currentPriceRange.min ? '' : filters.priceRange.min.toString(),
            maxTotal: filters.priceRange.max === currentPriceRange.max ? '' : filters.priceRange.max.toString(),
            productSearch: filters.productSearch,
            startDate: filters.startDate || '',
            endDate: filters.endDate || '',
            minQuantity: filters.quantityRange.min === currentQuantityRange.min ? '' : filters.quantityRange.min.toString(),
            maxQuantity: filters.quantityRange.max === currentQuantityRange.max ? '' : filters.quantityRange.max.toString(),
            sortBy: filters.sortBy === 'newest' || filters.sortBy === 'oldest' 
                ? 'created_at' 
                : 'total_amount',
            sortOrder: filters.sortBy === 'newest' 
                ? 'desc' 
                : filters.sortBy === 'oldest' 
                    ? 'asc' 
                    : filters.sortBy === 'priceHigh' 
                        ? 'desc' 
                        : 'asc' // priceLow
        };
        
        onApplyFilters(appliedFilters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = {
            status: 'all',
            sizes: [],
            priceRange: { min: orderPriceRange.min, max: orderPriceRange.max },
            productSearch: '',
            startDate: '',
            endDate: '',
            quantityRange: { min: quantityRange.min, max: quantityRange.max },
            sortBy: 'newest'
        };
        setFilters(resetFilters);
        setPriceRangeError('');
        setQuantityRangeError('');
        setDateRangeError('');
        setCalendarConfig(null);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.modalOverlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h2>Filter Orders</h2>
                        <button onClick={onClose} className={styles.closeButton}>×</button>
                    </div>

                    <div className={styles.modalContent}>
                        {/* Status Filter */}
                        <div className={styles.filterSection}>
                            <label className={styles.filterLabel}>Order Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleInputChange}
                                className={styles.select}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Size Filter */}
                        {availableSizes.length > 0 && (
                            <div className={styles.filterSection}>
                                <label className={styles.filterLabel}>Sizes</label>
                                <div className={styles.sizeGrid}>
                                    {availableSizes.map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => handleSizeToggle(size)}
                                            className={`${styles.sizeButton} ${
                                                filters.sizes.includes(size) ? styles.sizeButtonActive : ''
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Price Range Filter */}
                        <div className={styles.filterSection}>
                            <label className={styles.filterLabel}>Total Amount Range</label>
                            <DualRangeSlider
                                min={orderPriceRange.min}
                                max={orderPriceRange.max}
                                step={1}
                                minValue={filters.priceRange.min}
                                maxValue={filters.priceRange.max}
                                onChange={handlePriceRangeChange}
                                formatValue={(value) => formatPrice(value, currency)}
                            />
                            {priceRangeError && (
                                <div className={styles.errorMessage}>{priceRangeError}</div>
                            )}
                        </div>

                        {/* Product Search */}
                        <div className={styles.filterSection}>
                            <label className={styles.filterLabel}>Product Name</label>
                            <input
                                type="text"
                                name="productSearch"
                                value={filters.productSearch}
                                onChange={handleInputChange}
                                placeholder="Search by product name..."
                                className={styles.input}
                            />
                        </div>

                        {/* Date Range */}
                        <div className={styles.filterSection}>
                            <label className={styles.filterLabel}>Order Date Range</label>
                            <div className={styles.rangeInputs}>
                                <div className={styles.dateInputWrapper}>
                                    <input
                                        type="text"
                                        name="startDate"
                                        value={filters?.startDate || ''}
                                        onChange={handleDateInputChange}
                                        placeholder="Start Date (YYYY-MM-DD)"
                                        className={`${styles.input} ${styles.dateInput} ${dateRangeError ? styles.inputError : ''}`}
                                        readOnly
                                        onClick={handleOpenStartCalendar}
                                    />
                                    <button
                                        type="button"
                                        className={styles.calendarButton}
                                        onClick={handleOpenStartCalendar}
                                        title="Select start date"
                                    >
                                        📅
                                    </button>
                                </div>
                                <span className={styles.rangeSeparator}>to</span>
                                <div className={styles.dateInputWrapper}>
                                    <input
                                        type="text"
                                        name="endDate"
                                        value={filters?.endDate || ''}
                                        onChange={handleDateInputChange}
                                        placeholder="End Date (YYYY-MM-DD)"
                                        className={`${styles.input} ${styles.dateInput} ${dateRangeError ? styles.inputError : ''}`}
                                        readOnly
                                        onClick={handleOpenEndCalendar}
                                    />
                                    <button
                                        type="button"
                                        className={styles.calendarButton}
                                        onClick={handleOpenEndCalendar}
                                        title="Select end date"
                                    >
                                        📅
                                    </button>
                                </div>
                            </div>
                            {dateRangeError && (
                                <div className={styles.errorMessage}>{dateRangeError}</div>
                            )}
                        </div>

                        {/* Quantity Range Filter */}
                        <div className={styles.filterSection}>
                            <label className={styles.filterLabel}>Item Quantity Range</label>
                            <DualRangeSlider
                                min={quantityRange.min}
                                max={quantityRange.max}
                                step={1}
                                minValue={filters.quantityRange.min}
                                maxValue={filters.quantityRange.max}
                                onChange={handleQuantityRangeChange}
                                formatValue={(value) => value.toString()}
                            />
                            {quantityRangeError && (
                                <div className={styles.errorMessage}>{quantityRangeError}</div>
                            )}
                        </div>

                        {/* Sort Options */}
                        <div className={styles.filterSection}>
                            <label className={styles.filterLabel}>Sort By</label>
                            <select
                                name="sortBy"
                                value={filters.sortBy}
                                onChange={handleInputChange}
                                className={styles.select}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="priceHigh">By Price (High to Low)</option>
                                <option value="priceLow">By Price (Low to High)</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            onClick={handleReset}
                            className={styles.resetButton}
                        >
                            Reset Filters
                        </button>
                        <div className={styles.actionButtons}>
                            <button
                                type="button"
                                onClick={onClose}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleApply}
                                className={styles.applyButton}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Modal */}
            {calendarConfig && (
                <Calendar
                    selectedDate={calendarConfig.selectedDate}
                    onDateSelect={calendarConfig.onDateSelect}
                    onClose={handleCloseCalendar}
                    minDate={calendarConfig.minDate}
                    maxDate={calendarConfig.maxDate}
                />
            )}
        </>
    );
};

export default OrderFilterModal;
