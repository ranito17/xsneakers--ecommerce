import React, { useState, useEffect } from 'react';
import styles from './calendar.module.css';

/**
 * Calendar Component
 * 
 * A modern date picker modal for selecting dates in the analytics dashboard.
 * Features:
 * - Month navigation
 * - Date selection with visual feedback
 * - Today highlighting
 * - Date range validation
 * - Responsive design
 * - Fixed timezone handling
 */
const Calendar = ({ selectedDate, onDateSelect, onClose, minDate, maxDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDateState, setSelectedDateState] = useState(selectedDate ? new Date(selectedDate) : null);

    useEffect(() => {
        if (selectedDate) {
            setSelectedDateState(new Date(selectedDate));
            setCurrentMonth(new Date(selectedDate));
        }
    }, [selectedDate]);

    /**
     * Get month name with year
     * @param {Date} date - Date object
     * @returns {string} Formatted month and year
     */
    const getMonthName = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    /**
     * Get number of days in a month
     * @param {Date} date - Date object
     * @returns {number} Number of days in the month
     */
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    /**
     * Get first day of month (0 = Sunday, 1 = Monday, etc.)
     * @param {Date} date - Date object
     * @returns {number} Day of week (0-6)
     */
    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    /**
     * Generate calendar days array for the current month
     * @returns {Array} Array of date objects and null values for empty cells
     */
    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            days.push(date);
        }

        return days;
    };

    /**
     * Navigate to previous month
     */
    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    /**
     * Navigate to next month
     */
    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    /**
     * Format date to YYYY-MM-DD without timezone issues
     * @param {Date} date - Date object
     * @returns {string} Date in YYYY-MM-DD format
     */
    const formatDateToISO = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    /**
     * Handle date selection
     * @param {Date} date - Selected date object
     */
    const handleDateClick = (date) => {
        if (!date) return;

        // Check if date is within allowed range
        if (minDate && date < new Date(minDate)) return;
        if (maxDate && date > new Date(maxDate)) return;

        setSelectedDateState(date);
        // Use the fixed date formatting to avoid timezone issues
        onDateSelect(formatDateToISO(date));
        onClose();
    };

    /**
     * Check if date is today
     * @param {Date} date - Date to check
     * @returns {boolean} True if date is today
     */
    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    /**
     * Check if date is selected
     * @param {Date} date - Date to check
     * @returns {boolean} True if date is selected
     */
    const isSelected = (date) => {
        if (!date || !selectedDateState) return false;
        return date.toDateString() === selectedDateState.toDateString();
    };

    /**
     * Check if date is disabled
     * @param {Date} date - Date to check
     * @returns {boolean} True if date is disabled
     */
    const isDisabled = (date) => {
        if (!date) return false;
        if (minDate && date < new Date(minDate)) return true;
        if (maxDate && date > new Date(maxDate)) return true;
        return false;
    };

    const calendarDays = generateCalendarDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className={styles.calendarModal}>
            <div className={styles.calendarOverlay} onClick={onClose}></div>
            <div className={styles.calendarContainer}>
                <div className={styles.calendarHeader}>
                    <button 
                        className={styles.navButton}
                        onClick={goToPreviousMonth}
                        aria-label="Previous month"
                    >
                        ‹
                    </button>
                    <h3 className={styles.monthTitle}>{getMonthName(currentMonth)}</h3>
                    <button 
                        className={styles.navButton}
                        onClick={goToNextMonth}
                        aria-label="Next month"
                    >
                        ›
                    </button>
                </div>

                <div className={styles.weekDays}>
                    {weekDays.map(day => (
                        <div key={day} className={styles.weekDay}>
                            {day}
                        </div>
                    ))}
                </div>

                <div className={styles.calendarGrid}>
                    {calendarDays.map((date, index) => (
                        <button
                            key={index}
                            className={`${styles.calendarDay} ${
                                !date ? styles.emptyDay :
                                isSelected(date) ? styles.selectedDay :
                                isToday(date) ? styles.today :
                                isDisabled(date) ? styles.disabledDay :
                                styles.regularDay
                            }`}
                            onClick={() => handleDateClick(date)}
                            disabled={!date || isDisabled(date)}
                        >
                            {date ? date.getDate() : ''}
                        </button>
                    ))}
                </div>

                <div className={styles.calendarFooter}>
                    <button className={styles.todayButton} onClick={() => handleDateClick(new Date())}>
                        Today
                    </button>
                    <button className={styles.closeButton} onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
