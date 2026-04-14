import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthentication';
import { useToast } from '../components/common/toast';
import { productApi, analyticsApi } from '../services';
import { addToWishlist, removeFromWishlist, getWishlist } from '../services/userApi';
import { useSettings } from '../context/SettingsProvider';
import HeroSection from '../components/home/HeroSection';
import NewArrivals from '../components/home/NewArrivals';
import BestSellers from '../components/home/BestSellers';
import CategoryContainer from '../components/home/categoryContainer/CategoryContainer';
import { ErrorContainer, LoadingContainer, ImageModal } from '../components/contactForm';
import { ProductList } from '../components/products';
import { SearchBar } from '../components/admin/common';
import { formatSizesForCustomer } from '../utils/product.utils';
import { parseImageUrls, getAbsoluteImageUrl } from '../utils/image.utils';
import styles from './pages.module.css';

function Home() {
    const { settings } = useSettings();
    const { isAuthenticated, user } = useAuth();
    const { showError, showInfo } = useToast();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState(null);
    const [bestSellersLoading, setBestSellersLoading] = useState(true);
    const [bestSellersError, setBestSellersError] = useState(null);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [modalImages, setModalImages] = useState([]);
    const [modalAlt, setModalAlt] = useState('');
    const [modalInitialIndex, setModalInitialIndex] = useState(0);
    const [wishlistIds, setWishlistIds] = useState([]);
    // fetchProducts - טוען את כל המוצרים מהשרת
    // שליחה לשרת: getProducts()
    // תגובה מהשרת: { success: true, data: [...] }
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await productApi.getProducts();
            if (response.success && response.data) {
                const products = response.data.map(product => ({
                    ...product,
                    sizes_display: formatSizesForCustomer(product.sizes)
                }));
                setAllProducts(products);
                // Don't set newArrivals/featuredProducts here - let the useEffect handle it
                // This ensures we always use the correct settings value
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products. Please try again.');
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
    // שליחה לשרת: getBestSellers()
    // תגובה מהשרת: { success: true, data: { products: [...] } }
    const fetchBestSellers = async () => {
        try {
            setBestSellersLoading(true);
            setBestSellersError(null);
            const response = await analyticsApi.getBestSellers();
            if (response.success && response.data) {
                const { products } = response.data;
                let formattedProducts = products.map(product => {
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
                const displayLimit = settings?.homepage_display_limit ?? 8;
                if (displayLimit > 0) {
                    setBestSellers(formattedProducts.slice(0, displayLimit));
                } else {
                    setBestSellers([]);
                }
            } else {
                throw new Error('Failed to fetch best sellers data');
            }
        } catch (error) {
            console.error('Error fetching best sellers:', error);
            setBestSellersError('Failed to load best sellers. Please try again.');
            try {
                const displayLimit = settings?.homepage_display_limit ?? 8;
                if (displayLimit > 0) {
                    const fallbackProducts = allProducts
                        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                        .slice(0, displayLimit);
                    setBestSellers(fallbackProducts);
                } else {
                    setBestSellers([]);
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
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


    // handleSearchChange - מעדכן את מילת החיפוש
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim() || selectedCategory !== 'all') {
            setShowSearchResults(true);
        } else {
            setShowSearchResults(false);
        }
    };


    // handleCategoryChange - מעדכן את הקטגוריה הנבחרת
    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setSelectedCategory(categoryId);
        if (categoryId !== 'all' || searchQuery.trim()) {
            setShowSearchResults(true);
        } else {
            setShowSearchResults(false);
        }
    };


    // handleImageClick - פותח מודל תמונה
    const handleImageClick = (images, alt, initialIndex = 0) => {
        setModalImages(images);
        setModalAlt(alt);
        setModalInitialIndex(initialIndex);
        setImageModalOpen(true);
    };


    // handleModalClose - סוגר מודל תמונה
    const handleModalClose = () => {
        setImageModalOpen(false);
        setModalImages([]);
        setModalAlt('');
        setModalInitialIndex(0);
    };


    useEffect(() => {
        fetchProducts();
        fetchCategories();
        if (isAuthenticated) {
            loadWishlist();
        }
    }, [isAuthenticated]);


    useEffect(() => {
        if (allProducts.length > 0) {
            fetchBestSellers();
        }
    }, [allProducts]);

    // Update newArrivals and featuredProducts when displayLimit changes
    useEffect(() => {
        if (allProducts.length > 0) {
            // Only update if settings are loaded (to avoid defaulting to 8)
            // Check for both undefined and null
            if (settings?.homepage_display_limit !== undefined && settings?.homepage_display_limit !== null) {
                const displayLimit = Number(settings.homepage_display_limit);
                if (displayLimit > 0) {
                    setFeaturedProducts(allProducts.slice(0, displayLimit));
                    const sortedByDate = [...allProducts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                    setNewArrivals(sortedByDate.slice(0, displayLimit));
                } else {
                    setFeaturedProducts([]);
                    setNewArrivals([]);
                }
            }
        }
    }, [allProducts, settings?.homepage_display_limit]);
    const getFilteredProducts = () => {
        let filtered = allProducts;
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => 
                product.category_id == selectedCategory
            );
        }
        if (searchQuery.trim()) {
            filtered = filtered.filter(product => {
                const searchTerm = searchQuery.toLowerCase().trim();
                const productName = (product.name || '').toLowerCase();
                return productName.startsWith(searchTerm);
            });
        }
        return filtered;
    };
    if (error) {
        return (
            <div className={styles.homePage}>
                <div className={styles.mainContent}>
                    <HeroSection />
                    <ErrorContainer 
                        message={error} 
                        onRetry={fetchProducts}
                        showRetry={true}
                    />
                </div>
            </div>
        );
    }
    return (
        <div className={styles.homePage}>
            <div className={styles.mainContent}>
                <div className={styles.homeSearchSection}>
                    <div className={styles.searchControls}>
                        <SearchBar
                            count={getFilteredProducts().length}
                            itemName="product"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e)}
                            onClear={() => {
                                setSearchQuery('');
                                setShowSearchResults(false);
                            }}
                        />
                        <div className={styles.categoryContainer}>
                            {categoriesLoading ? (
                                <div className={styles.categoryLoadingInline}>
                                    <div className={styles.categoryLoadingSpinner}></div>
                                    <span>Loading categories...</span>
                                </div>
                            ) : categoriesError ? (
                                <div className={styles.categoryError}>
                                    <span>Failed to load</span>
                                    <button 
                                        onClick={fetchCategories}
                                        className={styles.categoryRetryButton}
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                <select
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                    className={styles.categorySelect}
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category.category_id} value={category.category_id}>
                                            {category.category_name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                    <HeroSection />
                </div>
            {showSearchResults && (
                <div className={styles.searchResultsSection}>
                    <ProductList 
                        products={getFilteredProducts()}
                        onImageClick={handleImageClick}
                        wishlistIds={wishlistIds}
                        onAddToWishlist={handleAddToWishlist}
                        onRemoveFromWishlist={handleRemoveFromWishlist}
                        isAuthenticated={isAuthenticated}
                        user={user}
                    />
                </div>
            )}
            {!showSearchResults && (
                <>
                     {settings?.homepage_display_limit !== undefined && 
                      settings.homepage_display_limit > 0 && 
                      newArrivals.length > 0 && (
                         <NewArrivals
                             products={newArrivals}
                             loading={loading}
                             onImageClick={handleImageClick}
                             wishlistIds={wishlistIds}
                             onAddToWishlist={handleAddToWishlist}
                             onRemoveFromWishlist={handleRemoveFromWishlist}
                             isAuthenticated={isAuthenticated}
                             user={user}
                         />
                     )}
                     {((settings?.homepage_display_limit ?? 8) > 0 && bestSellers.length > 0) && (
                         <BestSellers 
                             products={bestSellers} 
                             loading={bestSellersLoading} 
                             error={bestSellersError}
                             onRetry={fetchBestSellers}
                             onImageClick={handleImageClick}
                             wishlistIds={wishlistIds}
                             onAddToWishlist={handleAddToWishlist}
                             onRemoveFromWishlist={handleRemoveFromWishlist}
                             isAuthenticated={isAuthenticated}
                             user={user}
                         />
                     )}
                     <CategoryContainer 
                         categories={categories}
                         loading={categoriesLoading}
                         error={categoriesError}
                     />
                </>
            )}
            <ImageModal
                open={imageModalOpen}
                images={modalImages}
                alt={modalAlt}
                initialIndex={modalInitialIndex}
                onClose={handleModalClose}
            />
            </div>
        </div>
    );
}

export default Home;
