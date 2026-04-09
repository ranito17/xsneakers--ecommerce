import React from 'react';
import styles from './categories.module.css';
import { getAbsoluteImageUrl, parseImageUrls } from '../../../utils/image.utils';

const CategoryCard = ({ 
    category, 
    onEdit, 
    onDeactivate,
    onActivate,
    onImageClick 
}) => {
    const getCategoryImage = (category) => {
        const first = parseImageUrls(category?.image_urls)?.[0];
        return first ? getAbsoluteImageUrl(first) : null;
    };

    const imageUrl = getCategoryImage(category);

    return (
        <div className={styles.categoryCard}>
            <div className={styles.categoryImageContainer}>
                {imageUrl ? (
                    <img 
                        src={imageUrl}
                        alt={category.category_name}
                        className={styles.categoryImage}
                        onClick={() => onImageClick(imageUrl, category.category_name)}
                    />
                ) : (
                    <div className={styles.categoryImagePlaceholder}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                    </div>
                )}
            </div>
            <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>{category.category_name}</h3>
                {category.description && (
                    <p className={styles.categoryDescription}>{category.description}</p>
                )}
            </div>
            <div className={styles.categoryActions}>
                <button
                    onClick={() => onEdit(category)}
                    className={styles.categoryEditButton}
                    title="Edit category"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                </button>
                {category.is_active === 0 ? (
                    <button
                        onClick={() => onActivate(category.category_id)}
                        className={styles.categoryActivateButton}
                        title="Activate category"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14"/>
                            <path d="M12 5v14"/>
                        </svg>
                        Activate
                    </button>
                ) : (
                    <button
                        onClick={() => onDeactivate(category.category_id)}
                        className={styles.categoryDeleteButton}
                        title="Deactivate category and its products"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14"/>
                        </svg>
                        Deactivate
                    </button>
                )}
            </div>
        </div>
    );
};

export default CategoryCard;

