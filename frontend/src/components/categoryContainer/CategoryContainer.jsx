
import React from 'react';
import styles from './categoryContainer.module.css';

const CategoryContainer = ({ categories, onCategoryChange, activeCategory, loading, error }) => {
    console.log('🔍 CategoryContainer Debug:', {
        categories: categories,
        activeCategory: activeCategory,
        categoriesLength: categories?.length,
        loading: loading,
        error: error
    });

    const getCategoryDescription = (category) => {
        if (category.description) {
            return category.description;
        }
        
        // Special case for "All Categories"
        if (category.category_name === 'All Categories') {
            return 'Explore our complete collection of premium sneakers from the world\'s leading brands. From athletic performance to street style, discover the perfect pair for every occasion.';
        }
        
        // Fallback descriptions
        const name = category.category_name.toLowerCase();
        if (name.includes('nike')) return "Premium athletic footwear and sportswear from the world's leading sports brand.";
        if (name.includes('adidas')) return "German sportswear giant offering cutting-edge athletic footwear and lifestyle sneakers.";
        if (name.includes('new balance')) return "Comfort-focused footwear combining classic style with modern comfort technology.";
        if (name.includes('puma')) return "Dynamic sportswear brand delivering high-performance athletic shoes with bold designs.";
        if (name.includes('vans')) return "Iconic skateboarding and lifestyle brand known for classic silhouettes and timeless designs.";
        
        return `Discover our ${category.category_name} collection of premium sneakers.`;
    };

    const getCategoryImage = (category) => {
        if (!category.image_urls || category.image_urls.length === 0) {
            return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop';
        }
        
        // Return the first image only
        return category.image_urls[0];
    };

    return (
        <div className={styles.categoryContainer}>
            {/* Single Category Showcase */}
            <div className={styles.categoryShowcase}>
                {(() => {
                    // Determine which category to show
                    let displayCategory;
                    
                    console.log('🎯 Determining display category:', {
                        activeCategory: activeCategory,
                        categories: categories,
                        isAll: !activeCategory || activeCategory === 'all'
                    });
                    
                    if (!activeCategory || activeCategory === 'all') {
                        // Show "All Categories" showcase
                        displayCategory = {
                            category_id: 'all',
                            category_name: 'All Categories',
                            description: 'Explore our complete collection of premium sneakers from the world\'s leading brands. From athletic performance to street style, discover the perfect pair for every occasion.',
                            image_urls: [
                                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop'
                            ]
                        };
                        console.log('✅ Showing All Categories:', displayCategory);
                    } else {
                        // Show selected category
                        displayCategory = categories.find(cat => cat.category_id == activeCategory);
                        console.log('🔍 Looking for category with ID:', activeCategory);
                        console.log('📋 Available categories:', categories.map(c => ({ id: c.category_id, name: c.category_name })));
                        console.log('✅ Found category:', displayCategory);
                    }
                    
                    if (!displayCategory) {
                        console.log('❌ No display category found, returning null');
                        return null;
                    }
                    
                    console.log('🎨 Rendering category card for:', displayCategory.category_name);
                    
                    return (
                        <div className={styles.categoryCard}>
                            {/* Image Section */}
                            <div className={styles.imageSection}>
                                <img
                                    src={getCategoryImage(displayCategory)}
                                    alt={displayCategory.category_name}
                                    className={styles.categoryImage}
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop';
                                    }}  
                                />
                                
                                {/* Overlay */}
                                <div className={styles.imageOverlay}>
                                    <div className={styles.overlayContent}>
                                        <span className={styles.viewMore}>View Collection</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Content Section */}
                            <div className={styles.contentSection}>
                                <h3 className={styles.categoryName}>{displayCategory.category_name}</h3>
                                <p className={styles.categoryDescription}>
                                    {getCategoryDescription(displayCategory)}
                                </p>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default CategoryContainer;
