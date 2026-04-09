import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './categoryContainer.module.css';
import { getAbsoluteImageUrl, parseImageUrls } from '../../../utils/image.utils';

const CategoryContainer = ({ categories, loading, error }) => {
    const navigate = useNavigate();

    const getCategoryImage = (category) => {
        const first = parseImageUrls(category?.image_urls)?.[0];
        return first ? getAbsoluteImageUrl(first) : null;
    };

    const handleCategoryClick = (categoryId) => {
        navigate(`/products?category=${categoryId}`);
    };

    if (loading) {
        return null;
    }

    if (error || !categories || categories.length === 0) {
        return null;
    }

    return (
        <div className={styles.categoryContainer}>
         
            
            <div className={styles.categoryGrid}>
                {categories.map(category => {
                    const imageUrl = getCategoryImage(category);
                    return (
                        <div 
                            key={category.category_id} 
                            className={styles.categoryCard}
                            onClick={() => handleCategoryClick(category.category_id)}
                        >
                            <div className={styles.categoryImageWrapper}>
                                {imageUrl ? (
                                    <img 
                                        src={imageUrl}
                                        alt={category.category_name}
                                        className={styles.categoryImage}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={styles.categoryImagePlaceholder} style={{ display: imageUrl ? 'none' : 'flex' }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                </div>
                            </div>
                            <div className={styles.categoryContent}>
                                <h3 className={styles.categoryName}>{category.category_name}</h3>
                                {category.description && (
                                    <p className={styles.categoryDescription}>{category.description}</p>
                                )}
                            </div>
                            <div className={styles.categoryHover}>
                                <span className={styles.shopNow}>Shop Now</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                    <polyline points="12 5 19 12 12 19"/>
                                </svg>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryContainer;
