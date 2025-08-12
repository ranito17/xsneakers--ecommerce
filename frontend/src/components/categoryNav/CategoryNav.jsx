import React from 'react';
import styles from './categoryNav.module.css';

const CategoryNav = ({ categories = [], onCategoryChange, activeCategory = 'all', loading = false, error = null, onRetry = null }) => {
    console.log('🔍 CategoryNav props:', { categories, activeCategory, loading, error });

    const handleCategoryClick = (categoryId) => {
        console.log('🎯 Category clicked:', categoryId);
        onCategoryChange(categoryId);
    };

    // Get category description
    const getCategoryDescription = () => {
        if (activeCategory === 'all') {
            return "Browse our complete collection of premium sneakers from all brands and categories.";
        }
        
        const selectedCategory = categories.find(cat => cat.category_id === activeCategory);
        if (selectedCategory && selectedCategory.description) {
            return selectedCategory.description;
        }
        
        // Default descriptions based on category name
        if (selectedCategory) {
            const name = selectedCategory.category_name.toLowerCase();
            if (name.includes('running')) return "High-performance running shoes for athletes and fitness enthusiasts.";
            if (name.includes('basketball')) return "Professional basketball shoes for superior court performance.";
            if (name.includes('casual')) return "Comfortable everyday sneakers for style and comfort.";
            if (name.includes('lifestyle')) return "Trendy lifestyle sneakers that blend fashion with comfort.";
            if (name.includes('training')) return "Versatile training shoes for gym workouts and cross-training.";
            return `Discover our ${selectedCategory.category_name} collection of premium sneakers.`;
        }
        
        return "Explore our curated selection of premium sneakers.";
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
        console.log('🚨 CategoryNav showing error:', error);
        return (
            <div className={styles.categoryNavContainer}>
                <div className={styles.categoryNav}>
                    <div className={styles.errorMessage}>
                        {error}
                        <button 
                            onClick={() => window.location.reload()} 
                            className={styles.retryButton}
                            style={{
                                marginLeft: '10px',
                                padding: '5px 10px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '5px',
                                color: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                    </div>
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
                    <span className={styles.categoryName}>All Products</span>
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
                        <span className={styles.categoryName}>{category.category_name}</span>
                    </button>
                ))}
            </div>
            
            {/* Category Description */}
            <div className={styles.categoryDescription}>
                <p className={styles.descriptionText}>{getCategoryDescription()}</p>
            </div>
        </div>
    );
};

export default CategoryNav; 