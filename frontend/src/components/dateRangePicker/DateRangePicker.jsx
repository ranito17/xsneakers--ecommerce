import React, { useState, useEffect } from 'react';
import styles from './dateRangePicker.module.css';

const DateRangePicker = ({ onDateRangeChange, initialStartDate, initialEndDate, onOpenCalendar }) => {
    const [startDate, setStartDate] = useState(initialStartDate || getDefaultStartDate());
    const [endDate, setEndDate] = useState(initialEndDate || getDefaultEndDate());
    const [months, setMonths] = useState(1);

    // Helper functions for date calculations
    function getDefaultStartDate() {
        const date = new Date();
        date.setDate(date.getDate() - 30); // Default to last 30 days (1 month)
        return date.toISOString().split('T')[0];
    }

    function getDefaultEndDate() {
        return new Date().toISOString().split('T')[0];
    }

    // Calculate date range based on months
    const calculateDateRange = (monthsValue) => {
        const end = new Date();
        const start = new Date();
        
        // Subtract months from current date
        start.setMonth(start.getMonth() - monthsValue);
        
        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        };
    };

    // Handle custom date changes
    const handleStartDateChange = (newStartDate) => {
        setStartDate(newStartDate);
        
        if (newStartDate && endDate) {
            onDateRangeChange(newStartDate, endDate);
        }
    };

    const handleEndDateChange = (newEndDate) => {
        setEndDate(newEndDate);
        
        if (startDate && newEndDate) {
            onDateRangeChange(startDate, newEndDate);
        }
    };

    // Handle months input change
    const handleMonthsChange = (e) => {
        const monthsValue = parseInt(e.target.value) || 0;
        setMonths(monthsValue);
        
        const { startDate: newStartDate, endDate: newEndDate } = calculateDateRange(monthsValue);
        setStartDate(newStartDate);
        setEndDate(newEndDate);
        onDateRangeChange(newStartDate, newEndDate);
    };

    // Open calendar for start date
    const openStartCalendar = () => {
        onOpenCalendar('start', {
            selectedDate: startDate,
            onDateSelect: handleStartDateChange,
            maxDate: endDate
        });
    };

    // Open calendar for end date
    const openEndCalendar = () => {
        onOpenCalendar('end', {
            selectedDate: endDate,
            onDateSelect: handleEndDateChange,
            minDate: startDate,
            maxDate: new Date().toISOString().split('T')[0]
        });
    };

    // Validate date range
    const isDateRangeValid = () => {
        if (!startDate || !endDate) return false;
        return new Date(startDate) <= new Date(endDate);
    };

    // Get date range info
    const getDateRangeInfo = () => {
        if (!startDate || !endDate) return '';
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    };

    // Initialize with default dates
    useEffect(() => {
        if (initialStartDate && initialEndDate) {
            setStartDate(initialStartDate);
            setEndDate(initialEndDate);
        } else {
            const { startDate: defaultStart, endDate: defaultEnd } = calculateDateRange(1);
            setStartDate(defaultStart);
            setEndDate(defaultEnd);
            onDateRangeChange(defaultStart, defaultEnd);
        }
    }, []);

    return (
        <div className={styles.dateRangePicker}>
            <div className={styles.quickRange}>
                <div className={styles.rangeInputGroup}>
                    <label htmlFor="months" className={styles.label}>
                        Last Months
                    </label>
                    <input
                        type="number"
                        id="months"
                        value={months}
                        onChange={handleMonthsChange}
                        className={styles.rangeInput}
                        min="0"
                        max="12"
                        placeholder="0"
                    />
                </div>
            </div>

            <div className={styles.customDates}>
                <div className={styles.dateInputGroup}>
                    <label htmlFor="startDate" className={styles.label}>
                        Start Date
                    </label>
                    <div className={styles.dateInputWrapper}>
                        <input
                            type="text"
                            id="startDate"
                            value={startDate}
                            className={styles.dateInput}
                            placeholder="YYYY-MM-DD"
                            readOnly
                            onClick={openStartCalendar}
                        />
                        <button 
                            className={styles.calendarButton}
                            onClick={openStartCalendar}
                        >
                            📅
                        </button>
                    </div>
                </div>
                
                <div className={styles.dateInputGroup}>
                    <label htmlFor="endDate" className={styles.label}>
                        End Date
                    </label>
                    <div className={styles.dateInputWrapper}>
                        <input
                            type="text"
                            id="endDate"
                            value={endDate}
                            className={styles.dateInput}
                            placeholder="YYYY-MM-DD"
                            readOnly
                            onClick={openEndCalendar}
                        />
                        <button 
                            className={styles.calendarButton}
                            onClick={openEndCalendar}
                        >
                            📅
                        </button>
                    </div>
                </div>
            </div>
            
            {!isDateRangeValid() && (
                <div className={styles.error}>
                    Please select a valid date range
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
