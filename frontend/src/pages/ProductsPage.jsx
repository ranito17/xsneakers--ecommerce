    // frontend/src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { productApi } from '../services/index';
import ProductList from '../components/productList/ProductList';
import CategoryNav from '../components/categoryNav/CategoryNav';
import styles from './pages.module.css';
import ImageModal from '../components/imageModal/ImageModal';


const ProductsPage = () => {
    // מצב המוצרים - מערך של כל המוצרים מהשרת
    const [products, setProducts] = useState([]);
    // מצב טעינה - מציג ספינר בזמן טעינת נתונים
    const [loading, setLoading] = useState(true);
    // מצב שגיאה - מציג הודעת שגיאה אם יש בעיה
    const [error, setError] = useState(null);
    // מצב קטגוריה נבחרת - לסנן מוצרים לפי קטגוריה
    const [selectedCategory, setSelectedCategory] = useState('all');
    // מצב קטגוריות - רשימת כל הקטגוריות
    const [categories, setCategories] = useState([]);
    // מצב מיון - למיין מוצרים
    const [sortBy, setSortBy] = useState('name');
    // מצב חיפוש - חיפוש מוצרים
    const [searchQuery, setSearchQuery] = useState('');
    // מצב מודל תמונה - לפתיחת מודל תמונה
    const [imageModal, setImageModal] = useState({
        open: false,
        images: [],
        alt: '',
        initialIndex: 0
    });
    // טעינת מוצרים וקטגוריות בעת טעינת הקומפוננטה
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);
    // פונקציה לקבלת כל המוצרים מהשרת באמצעות productApi
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await productApi.getProducts();

            if (response.success) {
                setProducts(response.data || []);
            } else {
                setError('Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    // פונקציה לעדכון מוצר קיים




    // פונקציה למחיקת מוצר
    // axios מבצע בקשה DELETE לנתיב /productRoutes/:id למחיקת המוצר
   

    // פונקציה לקבלת כל הקטגוריות מהשרת
    const fetchCategories = async () => {
        try {
            console.log('🔍 Fetching categories...');
            const response = await productApi.getCategories();
            console.log('✅ Categories response:', response);
            setCategories(response.data || []);
            console.log('📋 Categories set:', response.data || []);
        } catch (error) {
            console.error('❌ Error fetching categories:', error);
        }
    };

    // פונקציה לסנן מוצרים לפי קטגוריה
    const handleCategoryChange = (categoryId) => {
        console.log('Category changed to:', categoryId);
        setSelectedCategory(categoryId);
    };

    // פונקציה לסנן מוצרים לפי הקטגוריה הנבחרת וחיפוש
    const getFilteredProducts = () => {
        let filtered = products;
        
        console.log('🔍 Filtering products:', { selectedCategory, productsCount: products.length });
        
        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => {
                const matches = product.category_id === selectedCategory;
                console.log(`Product ${product.name}: category_id=${product.category_id}, selectedCategory=${selectedCategory}, matches=${matches}`);
                return matches;
            });
        }
        
        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(product => {
                const searchTerm = searchQuery.toLowerCase().trim();
                const productName = product.name?.toLowerCase() || '';
                const productDescription = product.description?.toLowerCase() || '';
                const productColor = product.color?.toLowerCase() || '';
                
                return productName.includes(searchTerm) || 
                       productDescription.includes(searchTerm) || 
                       productColor.includes(searchTerm);
            });
        }
        
        return filtered;
    };

    // פונקציה למיין מוצרים
    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    // פונקציה לחיפוש מוצרים
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // פונקציה לפתיחת מודל תמונה
    const handleOpenImageModal = (images, alt, initialIndex = 0) => {
        console.log('handleOpenImageModal called with:', { images, alt, initialIndex });
        setImageModal({
            open: true,
            images,
            alt,
            initialIndex
        });
    };

    // פונקציה לסגירת מודל תמונה
    const handleCloseImageModal = () => {
        setImageModal(prev => ({ ...prev, open: false }));
    };

    // פונקציה למיין מוצרים
    const sortProducts = (productsToSort, sortType) => {
        const sorted = [...productsToSort];
        
        switch (sortType) {
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price);
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
           
            default:
                return sorted;
        }
    };

    // קבלת מוצרים מסוננים וממוינים
    const getProcessedProducts = () => {
        const filtered = getFilteredProducts();
        return sortProducts(filtered, sortBy);
    };

    // מצג טעינה - מציג ספינר בזמן טעינת נתונים
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading products...</p>
            </div>
        );
    }

    // מצג שגיאה - מציג הודעת שגיאה עם כפתור ניסיון חוזר
    if (error) {
        return (
            <div className={styles.errorContainer}>
                <svg className={styles.errorIcon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <h3>Error Loading Products</h3>
                <p>{error}</p>
                <button 
                    onClick={fetchProducts}
                    className={styles.retryButton}
                >
                    Try Again
                </button>
            </div>
        );
    }

    // מצג ראשי - מציג את כל המוצרים עם אפשרויות ניהול
    return (
        <div className={styles.productsPage}>
            <div className={styles.pageHeader}>
                <h1>Our Products</h1>
                <p>Discover our amazing collection of products</p>
                
                {/* ניווט קטגוריות */}
                <CategoryNav 
                    categories={categories}
                    onCategoryChange={handleCategoryChange}
                    activeCategory={selectedCategory}
                    loading={loading}
                    error={error}
                />
            </div>

            {/* Controls Section */}
            <div className={styles.controlsSection}>
                {/* Search Bar */}
                <div className={styles.searchContainer}>
                    <div className={styles.searchInputWrapper}>
                        <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={styles.searchInput}
                        />
                    </div>
                </div>

                {/* Sort Controls */}
                <div className={styles.sortContainer}>
                    <label htmlFor="sortSelect" className={styles.sortLabel}>Sort by:</label>
                    <select
                        id="sortSelect"
                        value={sortBy}
                        onChange={handleSortChange}
                        className={styles.sortSelect}
                    >
                        <option value="name">Name (A-Z)</option>
                        <option value="price-low">Price (Low to High)</option>
                        <option value="price-high">Price (High to Low)</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>
            
            {/* Search Results Info */}
            {searchQuery.trim() && (
                <div className={styles.searchResultsInfo}>
                    <p>
                        {getProcessedProducts().length === 0 
                            ? `No products found for "${searchQuery}"`
                            : `Found ${getProcessedProducts().length} product${getProcessedProducts().length === 1 ? '' : 's'} for "${searchQuery}"`
                        }
                    </p>
                    {getProcessedProducts().length === 0 && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className={styles.clearSearchButton}
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            )}
            
            {/* רשימת המוצרים עם כל הפונקציות */}
            <ProductList 
                products={getProcessedProducts()}
                onImageClick={handleOpenImageModal}
            />
            
            {/* Image Modal */}
            <ImageModal
                open={imageModal.open}
                images={imageModal.images}
                alt={imageModal.alt}
                onClose={handleCloseImageModal}
                initialIndex={imageModal.initialIndex}
            />
        </div>
    );
};


export default ProductsPage;