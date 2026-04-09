import React from 'react';
import styles from './searchBar.module.css';

const SearchBar = ({ 
    count, 
    totalCount,
    itemName, 
    value, 
    onChange, 
    onClear,
    placeholder 
}) => {
    // Use count (filtered) for placeholder, totalCount is for reference if needed
    const displayCount = count !== undefined ? count : 0;
    // Handle special pluralization cases
    const pluralItemName = itemName === 'category' ? 'categories' : 
                           itemName === 'categorys' ? 'categories' :
                           displayCount !== 1 ? `${itemName}s` : itemName;
    const displayPlaceholder = placeholder || `Search ${displayCount} ${pluralItemName}...`;
    
    return (
        <div className={styles.searchContainer}>
            <input
                type="text"
                placeholder={displayPlaceholder}
                value={value}
                onChange={onChange}
                className={styles.searchInput}
            />
            {value && (
                <button
                    onClick={onClear}
                    className={styles.clearSearchBtn}
                    title="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default SearchBar;

