import React from 'react';
import styles from './categoryNav.module.css';

const CategoryNav = ({ categories = [], onCategoryChange, activeCategory = 'all', loading = false, error = null }) => {
    console.log('🔍 CategoryNav props:', { categories, activeCategory, loading, error });

    const handleCategoryClick = (categoryId) => {
        console.log('🎯 Category clicked:', categoryId);
            onCategoryChange(categoryId);
      
    };

    if (loading) {
        return (
            <div className={styles.categoryNavContainer}>
                <div className={styles.categoryNav}>
                    <div className={styles.loadingMessage}>Loading categories...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.categoryNavContainer}>
                <div className={styles.categoryNav}>
                    <div className={styles.errorMessage}>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.categoryNavContainer}>
            <div className={styles.categoryNav}>
                {/* All Categories Button */}
                <button
                    className={`${styles.categoryButton} ${activeCategory === 'all' ? styles.active : ''}`}
                    onClick={() => handleCategoryClick('all')}
                    type="button"
                    aria-label="Show all products"
                    aria-pressed={activeCategory === 'all'}
                    data-category="all"
                >
                    <span className={styles.categoryIcon}>🏠</span>
                    <span className={styles.categoryName}>All</span>
                    {activeCategory === 'all' && (
                        <div className={styles.activeIndicator} />
                    )}
                </button>
                
                {/* Category Buttons */}
                {categories.map((category) => (
                    <button
                        key={category.category_id}
                        className={`${styles.categoryButton} ${activeCategory === category.category_id ? styles.active : ''}`}
                        onClick={() => handleCategoryClick(category.category_id)}
                        type="button"
                        aria-label={`Filter by ${category.category_name}`}
                        aria-pressed={activeCategory === category.category_id}
                            data-category={category.category_id}
                        >
                        <span className={styles.categoryIcon}>👟</span>
                        <span className={styles.categoryName}>{category.category_name}</span>
                        {activeCategory === category.category_id && (
                            <div className={styles.activeIndicator} />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryNav; 