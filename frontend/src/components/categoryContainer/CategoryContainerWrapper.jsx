import React from 'react';
import CategoryContainer from './CategoryContainer';
import CategoryNav from '../categoryNav/CategoryNav';
import styles from './categoryContainerWrapper.module.css';

const CategoryContainerWrapper = ({ categories, onCategoryChange, activeCategory, loading, error }) => {
    return (
        <div className={styles.categoryContainerWrapper}>
        
            
            <CategoryNav 
                categories={categories}
                onCategoryChange={onCategoryChange}
                activeCategory={activeCategory}
                loading={loading}
                error={error}
            />
            
            <CategoryContainer 
                categories={categories}
                onCategoryChange={onCategoryChange}
                activeCategory={activeCategory}
                loading={loading}
                error={error}
            />
        </div>
    );
};

export default CategoryContainerWrapper;
