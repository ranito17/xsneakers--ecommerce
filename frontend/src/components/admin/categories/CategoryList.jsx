import React from 'react';
import CategoryCard from './CategoryCard';
import styles from './categories.module.css';

const CategoryList = ({ 
    categories, 
    onEdit, 
    onDeactivate,
    onActivate,
    onImageClick,
    searchTerm 
}) => {
    if (categories.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>
                    No categories found. {searchTerm ? 'Try adjusting your search.' : 'Click "Add Category" to create one.'}
                </p>
            </div>
        );
    }

    return (
        <div className={styles.categoryGrid}>
            {categories.map(category => (
                <CategoryCard
                    key={category.category_id}
                    category={category}
                    onEdit={onEdit}
                    onDeactivate={onDeactivate}
                    onActivate={onActivate}
                    onImageClick={onImageClick}
                />
            ))}
        </div>
    );
};

export default CategoryList;

