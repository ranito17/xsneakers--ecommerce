    // frontend/src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { productApi } from '../services/index';
import ProductList from '../components/productList/ProductList';
import CategoryContainerWrapper from '../components/categoryContainer/CategoryContainerWrapper';
import LoadingContainer from '../components/loading/LoadingContainer';
import ErrorContainer from '../components/error/ErrorContainer';
import styles from './pages.module.css';
import ImageModal from '../components/imageModal/ImageModal';


const ProductsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // מצב המוצרים - מערך של כל המוצרים מהשרת
    const [products, setProducts] = useState([]);
    console.log('🏪 Initial products state:', products);
    // מצב טעינה - מציג ספינר בזמן טעינת נתונים
    const [loading, setLoading] = useState(true);
    // מצב שגיאה - מציג הודעת שגיאה אם יש בעיה
    const [error, setError] = useState(null);
    // מצב קטגוריה נבחרת - לסנן מוצרים לפי קטגוריה
    const [selectedCategory, setSelectedCategory] = useState('all');
    // מצב קטגוריות - רשימת כל הקטגוריות
    const [categories, setCategories] = useState([]);
    // מצב טעינת קטגוריות - מציג ספינר בזמן טעינת קטגוריות
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    // מצב שגיאה בקטגוריות - מציג הודעת שגיאה אם יש בעיה
    const [categoriesError, setCategoriesError] = useState(null);
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

    // Read category from URL on component mount and when location changes
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const categoryFromUrl = searchParams.get('category');
        console.log('🔍 Category from URL:', categoryFromUrl, 'Current location.search:', location.search);
        if (categoryFromUrl) {
            console.log('✅ Setting selectedCategory to:', categoryFromUrl);
            setSelectedCategory(categoryFromUrl);
        } else {
            console.log('✅ Setting selectedCategory to: all');
            setSelectedCategory('all');
        }
    }, [location.search]);

    // פונקציה לקבלת כל המוצרים מהשרת באמצעות productApi
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔍 Fetching products...');
            
            const response = await productApi.getProducts();
            console.log('✅ Products response:', response);

            if (response.success) {
                setProducts(response.data || []);
                console.log('📦 Products set:', response.data || []);
            } else {
                console.warn('⚠️ Products response not successful:', response);
                setError('Failed to fetch products');
            }
        } catch (error) {
            console.error('❌ Error fetching products:', error);
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
            setCategoriesLoading(true);
            setCategoriesError(null);
            console.log('🔍 Fetching categories...');
            const response = await productApi.getCategories();
            console.log('✅ Categories response:', response);
            
            // Check if response has the expected structure
            if (response && response.success && Array.isArray(response.data)) {
                setCategories(response.data);
                console.log('📋 Categories set:', response.data);
            } else {
                console.warn('⚠️ Unexpected categories response structure:', response);
                setCategories([]);
            }
        } catch (error) {
            console.error('❌ Error fetching categories:', error);
            setCategoriesError(error.response?.data?.message || 'Failed to load categories');
            setCategories([]); // Set empty array on error
        } finally {
            setCategoriesLoading(false);
        }
    };

    // פונקציה לסנן מוצרים לפי קטגוריה
    const handleCategoryChange = (categoryId) => {
        console.log('🔄 Category changed to:', categoryId);
        setSelectedCategory(categoryId);
        
        // Update URL with category parameter
        if (categoryId === 'all') {
            console.log('📍 Navigating to: /products');
            navigate('/products');
        } else {
            console.log('📍 Navigating to: /products?category=' + categoryId);
            navigate(`/products?category=${categoryId}`);
        }
    };

    // פונקציה לסנן מוצרים לפי הקטגוריה הנבחרת וחיפוש
    const getFilteredProducts = () => {
        let filtered = products;
        
        console.log('🔍 Filtering products:', { selectedCategory, productsCount: products.length });
        
        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => {
                const matches = product.category_id == selectedCategory; // Use loose equality for type conversion
                console.log(`Product ${product.name}: category_id=${product.category_id} (${typeof product.category_id}), selectedCategory=${selectedCategory} (${typeof selectedCategory}), matches=${matches}`);
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
        console.log('🔄 Getting processed products. Current products state:', products);
        const filtered = getFilteredProducts();
        const sorted = sortProducts(filtered, sortBy);
        console.log('📊 Processed products result:', sorted.length, 'products');
        return sorted;
    };

    // מצג טעינה - מציג ספינר בזמן טעינת נתונים
    if (loading) {
        return <LoadingContainer message="Loading products..." size="medium" />;
    }

    // מצג שגיאה - מציג הודעת שגיאה עם כפתור ניסיון חוזר
    if (error) {
        return (
            <ErrorContainer 
                message={error}
                onRetry={() => {
                    fetchProducts();
                    fetchCategories();
                }}
            />
        );
    }

    // מצג ראשי - מציג את כל המוצרים עם אפשרויות ניהול
    return (
        <div className={styles.productsPage}>
            {/* Controls Section - Moved above categories */}
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
            
            {/* Category Container */}
            <CategoryContainerWrapper 
                categories={categories}
                onCategoryChange={handleCategoryChange}
                activeCategory={selectedCategory}
                loading={categoriesLoading}
                error={categoriesError}
            />
            
            {/* Products Section */}
            <div className={styles.productsSection}>
               
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
        </div>
    );
};


export default ProductsPage;