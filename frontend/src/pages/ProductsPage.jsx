import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthentication';
import { useToast } from '../components/common/toast';
import { productApi, analyticsApi } from '../services/index';
import { addToWishlist, removeFromWishlist, getWishlist } from '../services/userApi';
import { ProductList, CategoryNav } from '../components/products';
import { LoadingContainer, ErrorContainer, ImageModal } from '../components/contactForm';
import { SearchBar } from '../components/admin/common';
import FilterModal from '../components/common/filterModal/FilterModal';
import { 
    formatSizesForCustomer, 
    applyFilters, 
    getPriceRange, 
    getSizeRange 
} from '../utils/product.utils';
import { parseImageUrls, getAbsoluteImageUrl } from '../utils/image.utils';
import styles from './pages.module.css';

const ProductsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { showError, showInfo } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [imageModal, setImageModal] = useState({
        open: false,
        images: [],
        alt: '',
        initialIndex: 0
    });
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState(null);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [sizeRange, setSizeRange] = useState({ min: 3, max: 15 });
    const [bestSellersProducts, setBestSellersProducts] = useState([]);
    const [bestSellersLoading, setBestSellersLoading] = useState(false);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // fetchProducts - טוען את כל המוצרים מהשרת
    // שליחה לשרת: getProducts()
    // תגובה מהשרת: { success: true, data: [...] }
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await productApi.getProducts();
            if (response.success) {
                const processedProducts = (response.data || []).map(product => ({
                    ...product,
                    sizes_display: formatSizesForCustomer(product.sizes)
                }));
                setProducts(processedProducts);
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


    // fetchCategories - טוען את כל הקטגוריות מהשרת
    // שליחה לשרת: getCategories()
    // תגובה מהשרת: { success: true, data: [...] }
    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            setCategoriesError(null);
            const response = await productApi.getCategories();
            if (response && response.success && Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategoriesError(error.response?.data?.message || 'Failed to load categories');
            setCategories([]);
        } finally {
            setCategoriesLoading(false);
        }
    };


    // fetchBestSellers - טוען את המוצרים הנמכרים ביותר מהשרת
    // שליחה לשרת: getBestSellers('all')
    // תגובה מהשרת: { success: true, data: { products: [...] } }
    const fetchBestSellers = async () => {
        try {
            setBestSellersLoading(true);
            const response = await analyticsApi.getBestSellers('all');
            if (response.success && response.data) {
                const { products: bestSellers } = response.data;
                const formattedProducts = bestSellers.map(product => {
                    // Parse image_urls - backend returns it as 'images' field
                    const imageUrls = product.images || product.image_urls || '';
                    const parsedImages = parseImageUrls(imageUrls);
                    const absoluteImages = parsedImages.map(img => getAbsoluteImageUrl(img));
                    
                    return {
                        ...product,
                        id: product.product_id || product.id,
                        sizes_display: formatSizesForCustomer(product.sizes),
                        images: absoluteImages,
                        image_urls: absoluteImages.join(','),
                        img_url: absoluteImages[0] || null
                    };
                });
                setBestSellersProducts(formattedProducts);
            } else {
                throw new Error('Failed to fetch best sellers data');
            }
        } catch (error) {
            console.error('Error fetching best sellers:', error);
            setBestSellersProducts([]);
        } finally {
            setBestSellersLoading(false);
        }
    };


    // loadWishlist - טוען את רשימת ה-wishlist של המשתמש
    // שליחה לשרת: getWishlist()
    // תגובה מהשרת: { wishlist: [...] }
    const loadWishlist = async () => {
        try {
            const response = await getWishlist();
            const wishlist = response.wishlist || [];
            setWishlistIds(wishlist.map(id => Number(id)));
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }
    };


    // handleAddToWishlist - מוסיף מוצר ל-wishlist
    // שליחה לשרת: addToWishlist(productId)
    // תגובה מהשרת: { success: true }
    const handleAddToWishlist = async (productId) => {
        if (!isAuthenticated) {
            showInfo('Please login to add items to your wishlist');
            return;
        }
        if (user?.role === 'admin') {
            showInfo('Admins cannot add items to wishlist');
            return;
        }
        try {
            await addToWishlist(productId);
            setWishlistIds(prev => [...prev, Number(productId)]);
        } catch (error) {
            console.error('Error adding product to wishlist:', error);
            showError('Failed to add item to wishlist. Please try again.');
        }
    };


    // handleRemoveFromWishlist - מסיר מוצר מה-wishlist
    // שליחה לשרת: removeFromWishlist(productId)
    // תגובה מהשרת: { success: true }
    const handleRemoveFromWishlist = async (productId) => {
        try {
            await removeFromWishlist(productId);
            setWishlistIds(prev => prev.filter(id => id !== Number(productId)));
        } catch (error) {
            console.error('Error removing product from wishlist:', error);
            showError('Failed to remove item from wishlist. Please try again.');
        }
    };


    // handleCategoryChange - מעדכן את הקטגוריה הנבחרת ומנווט
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        if (categoryId === 'all') {
            navigate('/products');
        } else {
            navigate(`/products?category=${categoryId}`);
        }
    };


    // handleOpenImageModal - פותח מודל תמונה
    const handleOpenImageModal = (images, alt, initialIndex = 0) => {
        setImageModal({
            open: true,
            images,
            alt,
            initialIndex
        });
    };


    // handleCloseImageModal - סוגר מודל תמונה
    const handleCloseImageModal = () => {
        setImageModal(prev => ({ ...prev, open: false }));
    };


    // handleOpenFilterModal - פותח מודל פילטרים
    const handleOpenFilterModal = () => {
        setIsFilterModalOpen(true);
    };


    // handleCloseFilterModal - סוגר מודל פילטרים
    const handleCloseFilterModal = () => {
        setIsFilterModalOpen(false);
    };


    // handleApplyFilters - מטפל בהחלת פילטרים חדשים
    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
        const searchParams = new URLSearchParams(location.search);
        if (filters && filters.sortBy) {
            searchParams.set('sort', filters.sortBy);
            if (filters.sortBy === 'best-sellers') {
                fetchBestSellers();
            } else {
                setBestSellersProducts([]);
            }
        } else {
            searchParams.delete('sort');
            setBestSellersProducts([]);
        }
        const categoryParam = searchParams.get('category');
        const newSearch = searchParams.toString();
        const newUrl = categoryParam ? `/products?${newSearch}` : (newSearch ? `/products?${newSearch}` : '/products');
        navigate(newUrl, { replace: true });
    };


    // handleClearFilters - מנקה את כל הפילטרים הפעילים
    const handleClearFilters = () => {
        setActiveFilters(null);
        setBestSellersProducts([]);
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('sort');
        const categoryParam = searchParams.get('category');
        const newSearch = searchParams.toString();
        const newUrl = categoryParam ? `/products?${newSearch}` : '/products';
        navigate(newUrl, { replace: true });
    };


    // handleSearchChange - מעדכן את מילת החיפוש
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };


    useEffect(() => {
        fetchProducts();
        fetchCategories();
        if (isAuthenticated) {
            loadWishlist();
        }
    }, [isAuthenticated]);


    useEffect(() => {
        if (products.length > 0) {
            const calculatedPriceRange = getPriceRange(products);
            const calculatedSizeRange = getSizeRange(products);
            setPriceRange(calculatedPriceRange);
            setSizeRange(calculatedSizeRange);
        }
    }, [products]);


    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const categoryFromUrl = searchParams.get('category');
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
        } else {
            setSelectedCategory('all');
        }
    }, [location.search]);


    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const sortFromUrl = searchParams.get('sort');
        if (sortFromUrl) {
            const initialFilters = {
                priceRange: { min: priceRange.min, max: priceRange.max },
                sizeRange: { min: sizeRange.min, max: sizeRange.max },
                sortBy: sortFromUrl
            };
            setActiveFilters(initialFilters);
            if (sortFromUrl !== 'best-sellers') {
                setBestSellersProducts([]);
            }
        } else if (!sortFromUrl) {
            setActiveFilters(prev => {
                if (prev && prev.sortBy) {
                    return null;
                }
                return prev;
            });
            setBestSellersProducts([]);
        }
    }, [location.search, priceRange, sizeRange]);


    useEffect(() => {
        if (activeFilters?.sortBy === 'best-sellers' && bestSellersProducts.length === 0 && !bestSellersLoading) {
            fetchBestSellers();
        }
    }, [activeFilters?.sortBy, bestSellersProducts.length, bestSellersLoading]);


    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery, activeFilters]);


    const getFilteredProducts = () => {
        const sourceProducts = (activeFilters?.sortBy === 'best-sellers' && bestSellersProducts.length > 0)
            ? bestSellersProducts
            : products;
        let filtered = sourceProducts;
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => {
                return product.category_id == selectedCategory;
            });
        }
        if (searchQuery.trim()) {
            filtered = filtered.filter(product => {
                const searchTerm = searchQuery.toLowerCase().trim();
                const productName = product.name?.toLowerCase() || '';
                return productName.startsWith(searchTerm);
            });
        }
        return filtered;
    };
    const getActiveFiltersCount = () => {
        if (!activeFilters) return 0;
        let count = 0;
        if (activeFilters.priceRange && 
            (activeFilters.priceRange.min !== priceRange.min || 
             activeFilters.priceRange.max !== priceRange.max)) {
            count++;
        }
        if (activeFilters.sizeRange && 
            (activeFilters.sizeRange.min !== sizeRange.min || 
             activeFilters.sizeRange.max !== sizeRange.max)) {
            count++;
        }
        if (activeFilters.sortBy) {
            count++;
        }
        return count;
    };
    const getProcessedProducts = () => {
        let filtered = getFilteredProducts();
        if (activeFilters) {
            const filtersToApply = {
                priceRange: null,
                sizeRange: null,
                sortBy: activeFilters.sortBy || ''
            };
            if (activeFilters.priceRange && 
                (activeFilters.priceRange.min !== priceRange.min || 
                 activeFilters.priceRange.max !== priceRange.max)) {
                filtersToApply.priceRange = activeFilters.priceRange;
            }
            if (activeFilters.sizeRange && 
                (activeFilters.sizeRange.min !== sizeRange.min || 
                 activeFilters.sizeRange.max !== sizeRange.max)) {
                filtersToApply.sizeRange = activeFilters.sizeRange;
            }
            if (filtersToApply.sortBy === 'best-sellers') {
                filtersToApply.sortBy = '';
            }
            const hasFilters = filtersToApply.priceRange || filtersToApply.sizeRange || filtersToApply.sortBy;
            if (hasFilters) {
                filtered = applyFilters(filtered, filtersToApply);
            } else {
                filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
            }
        } else {
            filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        }
        return filtered;
    };


    // getPaginatedProducts - מחזיר מוצרים לדף הנוכחי
    // שליחה לשרת: אין
    // תגובה מהשרת: אין - זה פילטור מקומי
    const getPaginatedProducts = () => {
        const processed = getProcessedProducts();
        const totalPages = Math.ceil(processed.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return {
            products: processed.slice(startIndex, endIndex),
            totalPages,
            totalProducts: processed.length,
            startIndex,
            endIndex
        };
    };


    // handlePageChange - מעדכן את העמוד הנוכחי
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    if (loading || (activeFilters?.sortBy === 'best-sellers' && bestSellersLoading)) {
        return <LoadingContainer message={activeFilters?.sortBy === 'best-sellers' ? "Loading best sellers..." : "Loading products..."} size="medium" />;
    }
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
    const { products: paginatedProducts, totalPages, totalProducts } = getPaginatedProducts();
    return (
        <div className={styles.productsPage}>
            <div className={styles.mainContent}>
                <div className={styles.topControlsSection}>
                    <div className={styles.controlsWrapper}>
                        <SearchBar
                            count={totalProducts}
                            itemName="product"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onClear={() => setSearchQuery('')}
                        />
                        <button 
                            className={`${styles.filterButton} ${activeFilters ? styles.filterActive : ''}`}
                            onClick={handleOpenFilterModal}
                            aria-label="Open filter modal"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                            </svg>
                            <span>
                                {getActiveFiltersCount() > 0 
                                    ? `${getActiveFiltersCount()} filter${getActiveFiltersCount() > 1 ? 's' : ''}`
                                    : 'Filters'
                                }
                            </span>
                        </button>
                    </div>
                </div>
                <div className={styles.categoryNavSection}>
                {categoriesLoading ? (
                    <div className={styles.categoryLoading}>
                        <div className={styles.categoryLoadingSpinner}></div>
                        <span>Loading categories...</span>
                    </div>
                ) : categoriesError ? (
                    <div className={styles.categoryError}>
                        <span>Failed to load categories</span>
                        <button 
                            onClick={fetchCategories}
                            className={styles.categoryRetryButton}
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <CategoryNav 
                        categories={categories}
                        onCategoryChange={handleCategoryChange}
                        activeCategory={selectedCategory}
                        loading={false}
                        error={null}
                        productCount={paginatedProducts.length}
                    />
                )}
                </div>
                {searchQuery.trim() && (
                    <div className={styles.searchResultsInfo}>
                        <p>
                            {totalProducts === 0 
                                ? `No products found for "${searchQuery}"`
                                : `Found ${totalProducts} product${totalProducts === 1 ? '' : 's'} for "${searchQuery}"`
                            }
                        </p>
                        {totalProducts === 0 && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className={styles.clearSearchButton}
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}
                <div className={styles.productsSection}>
                    <ProductList 
                        products={paginatedProducts}
                        totalProducts={totalProducts}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onImageClick={handleOpenImageModal}
                        wishlistIds={wishlistIds}
                        onAddToWishlist={handleAddToWishlist}
                        onRemoveFromWishlist={handleRemoveFromWishlist}
                        isAuthenticated={isAuthenticated}
                        user={user}
                    />
                    <ImageModal
                        open={imageModal.open}
                        images={imageModal.images}
                        alt={imageModal.alt}
                        onClose={handleCloseImageModal}
                        initialIndex={imageModal.initialIndex}
                    />
                </div>
            </div>
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={handleCloseFilterModal}
                onApplyFilter={handleApplyFilters}
                initialFilters={activeFilters}
                priceRange={priceRange}
                sizeRange={sizeRange}
            />
        </div>
    );
};

export default ProductsPage;
