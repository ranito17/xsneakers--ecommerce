import React, { useState } from 'react';
import styles from './activity.module.css';

const ActivityFilters = ({ filters, onFilterChange, onDeleteOld }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ [name]: value });
    };

    return (
        <div className={styles.filters}>
            <div className={styles.filterGroup}>
                <label htmlFor="days_back">Time Period</label>
                <select 
                    id="days_back"
                    name="days_back" 
                    value={filters.days_back} 
                    onChange={handleChange}
                    className={styles.select}
                >
                    <option value="1">Last 24 Hours</option>
                    <option value="7">Last Week</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                </select>
            </div>

            <div className={styles.filterGroup}>
                <label htmlFor="action_type">Action Type</label>
                <select 
                    id="action_type"
                    name="action_type" 
                    value={filters.action_type} 
                    onChange={handleChange}
                    className={styles.select}
                >
                    <option value="">All Actions</option>
                    <option value="ORDER_PLACED">Order Placed</option>
                    <option value="ORDER_STATUS_CHANGED">Order Status Changed</option>
                    <option value="ORDER_CANCELLED">Order Cancelled</option>
                    <option value="PRODUCT_CREATED">Product Created</option>
                    <option value="PRODUCT_UPDATED">Product Updated</option>
                    <option value="PRODUCT_DELETED">Product Deleted</option>
                    <option value="STOCK_CHANGED">Stock Changed</option>
                    <option value="STOCK_INCREASED">Stock Increased</option>
                    <option value="STOCK_DECREASED">Stock Decreased</option>
                    <option value="CATEGORY_CREATED">Category Created</option>
                    <option value="CATEGORY_UPDATED">Category Updated</option>
                    <option value="CATEGORY_DELETED">Category Deleted</option>
                    <option value="SETTINGS_UPDATED">Settings Updated</option>
                    <option value="USER_CREATED">User Account Created</option>
                    <option value="USER_DELETED">User Account Deleted</option>
                </select>
            </div>

            <div className={styles.filterGroup}>
                <label htmlFor="entity_type">Entity Type</label>
                <select 
                    id="entity_type"
                    name="entity_type" 
                    value={filters.entity_type} 
                    onChange={handleChange}
                    className={styles.select}
                >
                    <option value="">All Entities</option>
                    <option value="order">Orders</option>
                    <option value="product">Products</option>
                    <option value="category">Categories</option>
                    <option value="user">Users</option>
                    <option value="settings">Settings</option>
                    <option value="supplier">Supplier</option>
                </select>
            </div>

            <div className={styles.filterGroup}>
                <label htmlFor="user_email">User Email (Gmail)</label>
                <div className={styles.emailInputWrapper}>
                    <input 
                        type="text" 
                        id="user_email"
                        name="user_email"
                        placeholder="Search by email..."
                        value={filters.user_email || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleChange(e);
                        }}
                        onBlur={(e) => {
                            const value = e.target.value.trim();
                            // Auto-complete @gmail.com if user typed something without @
                            if (value && !value.includes('@')) {
                                onFilterChange({ user_email: value + '@gmail.com' });
                            }
                        }}
                        className={styles.input}
                        list="email-suggestions"
                    />
                    <datalist id="email-suggestions">
                        <option value="ranitobassy17@gmail.com" />
                        <option value="rtobassy@gmail.com" />
                        <option value="ranitobassy170@gmail.com" />
                    </datalist>
                </div>
            </div>

            {onDeleteOld && (
                <div className={styles.filterGroup}>
                    <label>&nbsp;</label>
                    <button
                        onClick={async () => {
                            setIsDeleting(true);
                            try {
                                await onDeleteOld();
                            } finally {
                                setIsDeleting(false);
                            }
                        }}
                        className={styles.deleteButton}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Clear Logs (90+ days)'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivityFilters;

