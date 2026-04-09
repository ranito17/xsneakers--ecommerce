// ProductManagment.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuthentication';
import { useSettings } from '../../context/SettingsProvider';
import { useLocation } from 'react-router-dom';
import { useToast } from '../../components/common/toast';

import { ImageModal, LoadingContainer, ErrorContainer } from '../../components/contactForm';
import { AdminProductList, ProductSizesModal, ProductImagesModal, AdminFilterModal, AdminProductModal} from '../../components/admin/products';
import { SearchBar } from '../../components/admin/common';
import ProtectedRoute from '../../components/ProtectedRoute';
import { productApi } from '../../services/productApi';
import { categoryApi } from '../../services/categoryApi';
import { uploadApi } from '../../services/uploadApi';
import { parseImageUrls, getAbsoluteImageUrl } from '../../utils/image.utils';
import styles from './adminPages.module.css';

const ProductManagement = () => {
    const { isAuthenticated, user } = useAuth();
    const { showError, showSuccess, showConfirmation } = useToast();
    const location = useLocation();
    const {
        settings,
        loading: settingsLoading,
        error: settingsError,
        getStockStatus,
        formatPrice,
        fetchSettings
    } = useSettings();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showSizesModal, setShowSizesModal] = useState(false);
    const [showImagesModal, setShowImagesModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [filterCriteria, setFilterCriteria] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [stockFilter, setStockFilter] = useState('all');
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedProductName, setSelectedProductName] = useState('');

    // loadProducts - טוען את כל המוצרים מהשרת
    // שליחה לשרת: getAllProducts()
    // תגובה מהשרת: { data: [...] }
    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await productApi.getAllProducts();
            setProducts(response.data || []);
        } catch (err) {
            console.error('Error loading products:', err);
            setError('Failed to load products. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);


    const fetchProducts = loadProducts;
    // loadCategories - טוען את כל הקטגוריות מהשרת
    // שליחה לשרת: getCategories()
    // תגובה מהשרת: { data: [...] }
    const loadCategories = useCallback(async () => {
        try {
            const response = await categoryApi.getCategories();
            setCategories(response.data || []);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    }, []);


    // handleSaveProduct - יוצר או מעדכן מוצר
    // שליחה לשרת: createProduct(productData) או updateProduct(id, productData)
    // תגובה מהשרת: { success: true, productId } או { success: true }
    const handleSaveProduct = async (productData) => {
        try {
            if (isNewProduct) {
                const response = await productApi.createProduct(productData);
                if (!response?.success) {
                    const message = response?.message || 'Failed to create product.';
                    showError(message);
                    // Throw error so modal can catch it and display it
                    throw new Error(message);
                }
                showSuccess(`Product "${productData.name}" created successfully!`);
                // רענון אוטומטי של רשימת המוצרים
                await fetchProducts();
            } else {
                const response = await productApi.updateProduct(selectedProduct.id, productData);
                if (response?.success === false) {
                    const message = response?.message || 'Failed to update product.';
                    showError(message);
                    // Throw error so modal can catch it and display it
                    throw new Error(message);
                }
                showSuccess(`Product "${productData.name}" updated successfully!`);
                // רענון אוטומטי של רשימת המוצרים
                await fetchProducts();
            }
            setShowModal(false);
        } catch (err) {
            console.error('Error saving product:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to save product. Please try again.';
            showError(errorMessage);
            throw new Error(errorMessage);
        }
    };


    // handleSaveSizes - מעדכן גדלי מוצר
    // שליחה לשרת: updateProductSizes(productId, sizes)
    // תגובה מהשרת: { success: true, data: { updatedSizes, totalStock } }
    const handleSaveSizes = async (productId, sizes, totalStock) => {
        try {
            // וידוא ש-sizes הוא מערך (לא מחרוזת JSON)
            const sizesArray = Array.isArray(sizes) ? sizes : (typeof sizes === 'string' ? JSON.parse(sizes) : []);
            
            // שימוש בפונקציה ייעודית לעדכון גדלים
            const response = await productApi.updateProductSizes(productId, sizesArray);
            
            if (response.success) {
                // רענון הנתונים
                await fetchProducts();
                // סגירת המודלים
                setShowSizesModal(false);
                setShowModal(false); // Close product modal if open
                setSelectedProduct(null);
                showSuccess('Product sizes updated successfully!');
            } else {
                showError(response.message || 'Failed to update product sizes');
            }
        } catch (error) {
            console.error('Error updating sizes:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update product sizes. Please try again.';
            showError(errorMessage);
        }
    };


    // handleImageUpload - מעלה תמונות למוצר
    // שליחה לשרת: uploadProductImages(productId, files)
    // תגובה מהשרת: { success: true }
    const handleImageUpload = async (productId, files) => {
        try {
            const response = await uploadApi.uploadProductImages(productId, files);
            if (response.success) {
                await loadProducts();
                // Don't close images modal - let user decide when to close
                // Refresh product data if modal is open
                if (selectedProduct && selectedProduct.id === productId) {
                    try {
                        const productDetails = await productApi.getProductById(productId);
                        if (productDetails.success && productDetails.data) {
                            setSelectedProduct(productDetails.data);
                        }
                    } catch (err) {
                        console.error('Error refreshing product:', err);
                    }
                }
                showSuccess('Images uploaded successfully!');
            } else {
                showError('Failed to upload images. Please try again.');
            }
        } catch (err) {
            console.error('Error uploading images:', err);
            showError('Failed to upload images. Please try again.');
        }
    };


    // handleImageDelete - מוחק תמונות מוצר
    // שליחה לשרת: deleteProductImage(productId, imageUrl) או deleteAllProductImages(productId)
    // תגובה מהשרת: { success: true }
    const handleImageDelete = async (productId, imageUrl) => {
        try {
            if (imageUrl === null) {
                const response = await uploadApi.deleteAllProductImages(productId);
                if (response.success) {
                    await loadProducts();
                    // Refresh product data if modal is open
                    if (selectedProduct && selectedProduct.id === productId) {
                        try {
                            const productDetails = await productApi.getProductById(productId);
                            if (productDetails.success && productDetails.data) {
                                setSelectedProduct(productDetails.data);
                            }
                        } catch (err) {
                            console.error('Error refreshing product:', err);
                        }
                    }
                    showSuccess('All images deleted successfully!');
                } else {
                    showError('Failed to delete all images. Please try again.');
                }
            } else {
                const response = await uploadApi.deleteProductImage(productId, imageUrl);
                if (response.success) {
                    await loadProducts();
                    // Refresh product data if modal is open
                    if (selectedProduct && selectedProduct.id === productId) {
                        try {
                            const productDetails = await productApi.getProductById(productId);
                            if (productDetails.success && productDetails.data) {
                                setSelectedProduct(productDetails.data);
                            }
                        } catch (err) {
                            console.error('Error refreshing product:', err);
                        }
                    }
                    showSuccess('Image deleted successfully!');
                } else {
                    showError('Failed to delete image. Please try again.');
                }
            }
        } catch (err) {
            console.error('Error deleting image:', err);
            showError('Failed to delete image. Please try again.');
        }
    };


    // handleAddProduct - פותח מודל יצירת מוצר חדש
    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsNewProduct(true);
        setShowModal(true);
    };


    // handleEditProduct - פותח מודל עריכת מוצר
    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setIsNewProduct(false);
        setShowModal(true);
    };


    // handleCloseModal - סוגר את מודל המוצר
    const handleCloseModal = () => {
        setShowModal(false);
        setShowSizesModal(false);
        setShowImagesModal(false);
        setSelectedProduct(null);
        setIsNewProduct(false);
    };


    // handleOpenSizesModal - פותח מודל ניהול גדלים
    const handleOpenSizesModal = (product) => {
        setSelectedProduct(product);
        setShowSizesModal(true);
    };


    // handleOpenImagesModal - פותח מודל ניהול תמונות
    const handleOpenImagesModal = (product) => {
        setSelectedProduct(product);
        setShowImagesModal(true);
    };


    // handleOpenImageModal - פותח מודל תצוגת תמונות
    const handleOpenImageModal = (images, productName) => {
        const imageArray = parseImageUrls(images).map(img => getAbsoluteImageUrl(img));
        setSelectedImages(imageArray);
        setSelectedProductName(productName);
        setImageModalOpen(true);
    };


    // handleCloseImageModal - סוגר מודל תצוגת תמונות
    const handleCloseImageModal = () => {
        setImageModalOpen(false);
        setSelectedImages([]);
        setSelectedProductName('');
    };


    // handleFilter - מגדיר קריטריוני סינון
    const handleFilter = (criteria) => {
        setFilterCriteria(criteria);
    };


    // handleClearFilters - מנקה את כל הפילטרים
    const handleClearFilters = () => {
        setFilterCriteria(null);
        setStockFilter('all');
    };


    // handleSearchChange - מעדכן את מילת החיפוש
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };


    // handleClearSearch - מנקה את מילת החיפוש
    const handleClearSearch = () => {
        setSearchTerm('');
    };


    useEffect(() => {
        if (isAuthenticated && user) {
            fetchSettings();
            loadProducts();
            loadCategories();
        }
    }, [isAuthenticated, user, fetchSettings, loadProducts, loadCategories]);


    useEffect(() => {
        if (location.state?.filter) {
            setStockFilter(location.state.filter);
        }
    }, [location]);


    useEffect(() => {
        let filtered = products;
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().startsWith(searchTerm.toLowerCase())
            );
        }
        if (filterCriteria && filterCriteria.category_id && filterCriteria.category_id !== 'all') {
            const categoryId = typeof filterCriteria.category_id === 'string'
                ? parseInt(filterCriteria.category_id)
                : filterCriteria.category_id;
            filtered = filtered.filter(product =>
                product.category_id === categoryId
            );
        }
        if (filterCriteria && filterCriteria.stockStatus && filterCriteria.stockStatus !== 'all') {
            if (filterCriteria.stockStatus === 'in-stock') {
                filtered = filtered.filter(p => p.stock_quantity > 0);
            } else if (filterCriteria.stockStatus === 'out-of-stock') {
                filtered = filtered.filter(p => p.stock_quantity === 0);
            }
        }
        if (filterCriteria && filterCriteria.sizeRange) {
            const minSize = filterCriteria.sizeRange.min;
            const maxSize = filterCriteria.sizeRange.max;
            const defaultSizeRange = { min: 3, max: 15 };
            if (minSize !== defaultSizeRange.min || maxSize !== defaultSizeRange.max) {
                filtered = filtered.filter(product => {
                    if (!product.sizes || !Array.isArray(product.sizes)) return false;
                    return product.sizes.some(sizeObj => {
                        const sizeValue = typeof sizeObj === 'object' ? parseFloat(sizeObj.size) : parseFloat(sizeObj);
                        return !isNaN(sizeValue) && sizeValue >= minSize && sizeValue <= maxSize;
                    });
                });
            }
        }
        if (stockFilter !== 'all') {
            const lowStockThreshold = settings?.low_stock_threshold || 10;
            const lowStockPerSizeThreshold = settings?.low_stock_threshold_per_size || 5;
            switch (stockFilter) {
                case 'low-stock':
                    filtered = filtered.filter(p => {
                        return p.stock_quantity > 0 && p.stock_quantity <= lowStockThreshold;
                    });
                    break;
                case 'low-stock-size':
                    filtered = filtered.filter(p => {
                        if (!p.sizes || !Array.isArray(p.sizes)) return false;
                        return p.sizes.some(sizeObj => {
                            const qty = sizeObj.quantity || 0;
                            return qty > 0 && qty <= lowStockPerSizeThreshold;
                        });
                    });
                    break;
                case 'active':
                    filtered = filtered.filter(p => {
                        const isActive = p.is_active !== 0 && p.is_active !== false;
                        return isActive;
                    });
                    break;
                case 'inactive':
                    filtered = filtered.filter(p => {
                        const isActive = p.is_active !== 0 && p.is_active !== false;
                        return !isActive;
                    });
                    break;
                default:
                    break;
            }
        }
        const sortBy = (filterCriteria && filterCriteria.sortBy) || 'newest';
        switch (sortBy) {
            case 'newest':
                filtered = [...filtered].sort((a, b) => {
                    const dateA = new Date(a.created_at || a.createdAt || 0);
                    const dateB = new Date(b.created_at || b.createdAt || 0);
                    return dateB - dateA;
                });
                break;
            case 'oldest':
                filtered = [...filtered].sort((a, b) => {
                    const dateA = new Date(a.created_at || a.createdAt || 0);
                    const dateB = new Date(b.created_at || b.createdAt || 0);
                    return dateA - dateB;
                });
                break;
            case 'name':
                filtered = [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            default:
                filtered = [...filtered].sort((a, b) => {
                    const dateA = new Date(a.created_at || a.createdAt || 0);
                    const dateB = new Date(b.created_at || b.createdAt || 0);
                    return dateB - dateA;
                });
                break;
        }
        setFilteredProducts(filtered);
    }, [products, searchTerm, stockFilter, filterCriteria, settings]);
    const getAppliedFiltersText = () => {
        if (!filterCriteria) return '';
        const filters = [];
        if (filterCriteria.category_id && filterCriteria.category_id !== 'all') {
            const category = categories.find(c => c.category_id === parseInt(filterCriteria.category_id));
            if (category) {
                filters.push(`Category: ${category.category_name}`);
            }
        }
        if (filterCriteria.stockStatus && filterCriteria.stockStatus !== 'all') {
            filters.push(`Stock: ${filterCriteria.stockStatus === 'in-stock' ? 'In Stock' : 'Out of Stock'}`);
        }
        if (filterCriteria.sizeRange) {
            const defaultSizeRange = { min: 3, max: 15 };
            if (filterCriteria.sizeRange.min !== defaultSizeRange.min ||
                filterCriteria.sizeRange.max !== defaultSizeRange.max) {
                filters.push(`Size: US ${filterCriteria.sizeRange.min} - ${filterCriteria.sizeRange.max}`);
            }
        }
        if (filterCriteria.sortBy && filterCriteria.sortBy !== 'newest') {
            const sortLabels = {
                'oldest': 'Oldest First',
                'name': 'Name (A-Z)'
            };
            if (sortLabels[filterCriteria.sortBy]) {
                filters.push(`Sort: ${sortLabels[filterCriteria.sortBy]}`);
            }
        }
        return filters.join(', ');
    };


    // getActiveFiltersCount - מחזיר את מספר הפילטרים הפעילים
    const getActiveFiltersCount = () => {
        if (!filterCriteria) return 0;
        let count = 0;
        if (filterCriteria.category_id && filterCriteria.category_id !== 'all') {
            count++;
        }
        if (filterCriteria.stockStatus && filterCriteria.stockStatus !== 'all') {
            count++;
        }
        if (filterCriteria.sizeRange) {
            const defaultSizeRange = { min: 3, max: 15 };
            if (filterCriteria.sizeRange.min !== defaultSizeRange.min ||
                filterCriteria.sizeRange.max !== defaultSizeRange.max) {
                count++;
            }
        }
        if (filterCriteria.sortBy && filterCriteria.sortBy !== 'newest') {
            count++;
        }
        return count;
    };
    if (settingsLoading) {
        return (
            <ProtectedRoute requiredRole="admin">
                <LoadingContainer message="Loading settings..." size="medium" />
            </ProtectedRoute>
        );
    }
    if (error || settingsError) {
        return (
            <ProtectedRoute requiredRole="admin">
                <ErrorContainer
                    message={error || settingsError}
                    onRetry={() => {
                        setError(null);
                        loadProducts();
                        loadCategories();
                    }}
                />
            </ProtectedRoute>
        );
    }
    return (
        <ProtectedRoute requiredRole="admin">
            <div className={styles.productManagement}>
                <div className={styles.productMainContent}>
                    <div className={styles.productFilterInfo}>
                        <SearchBar
                            count={filteredProducts.length}
                            itemName="product"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onClear={handleClearSearch}
                        />
                        <div className={styles.productControlsRight}>
                            <div className={styles.filterSection}>
                                <button
                                    className={styles.filterButton}
                                    onClick={() => setShowFilterModal(true)}
                                    title="Advanced filters"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 4h18M7 8h10M9 12h6M11 16h2"/>
                                    </svg>
                                    <span>
                                        {getActiveFiltersCount() > 0 
                                            ? `${getActiveFiltersCount()} filter${getActiveFiltersCount() > 1 ? 's' : ''}`
                                            : 'Filters'
                                        }
                                    </span>
                                </button>
                                <button
                                    className={styles.addProductBtn}
                                    onClick={handleAddProduct}
                                    title="Add new product"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12h14"/>
                                    </svg>
                                    Add Product
                                </button>
                            </div>
                        </div>
                    </div>
                    {!isLoading && products.length > 0 && (
                        <div className={styles.filterTabsSection}>
                            <div className={styles.stockFilterTabs}>
                                {/* Check if any filters are applied (category, search, etc) */}
                                {(() => {
                                    const hasFilters = searchTerm || (filterCriteria && (
                                        (filterCriteria.category_id && filterCriteria.category_id !== 'all') ||
                                        (filterCriteria.stockStatus && filterCriteria.stockStatus !== 'all') ||
                                        (filterCriteria.sizeRange && (
                                            filterCriteria.sizeRange.min !== 3 || 
                                            filterCriteria.sizeRange.max !== 15
                                        ))
                                    ));
                                    const productsToCount = hasFilters ? filteredProducts : products;
                                    
                                    return (
                                        <>
                                <button
                                    className={`${styles.filterTab} ${stockFilter === 'all' ? styles.activeTab : ''}`}
                                    onClick={() => setStockFilter('all')}
                                >
                                    All Products
                                                <span className={styles.tabCount}>
                                                    {productsToCount.length}
                                                </span>
                                </button>
                                <button
                                    className={`${styles.filterTab} ${stockFilter === 'low-stock' ? styles.activeTab : ''}`}
                                    onClick={() => setStockFilter('low-stock')}
                                >
                                    ⚠ Low Stock
                                    <span className={styles.tabCount}>
                                                    {productsToCount.filter(p => {
                                            const qty = p.stock_quantity || 0;
                                            const threshold = settings?.low_stock_threshold || 10;
                                            return qty > 0 && qty <= threshold;
                                        }).length}
                                    </span>
                                </button>
                                <button
                                    className={`${styles.filterTab} ${stockFilter === 'low-stock-size' ? styles.activeTab : ''}`}
                                    onClick={() => setStockFilter('low-stock-size')}
                                >
                                    📏 Low Stock by Size
                                    <span className={styles.tabCount}>
                                                    {productsToCount.filter(p => {
                                            if (!p.sizes || !Array.isArray(p.sizes)) return false;
                                            const threshold = settings?.low_stock_threshold_per_size || 5;
                                            return p.sizes.some(sizeObj => {
                                                const qty = sizeObj.quantity || 0;
                                                return qty > 0 && qty <= threshold;
                                            });
                                        }).length}
                                    </span>
                                </button>
                                <button
                                    className={`${styles.filterTab} ${stockFilter === 'active' ? styles.activeTab : ''}`}
                                    onClick={() => setStockFilter('active')}
                                >
                                    ✓ Active
                                    <span className={styles.tabCount}>
                                                    {productsToCount.filter(p => {
                                            const isActive = p.is_active !== 0 && p.is_active !== false;
                                            return isActive;
                                        }).length}
                                    </span>
                                </button>
                                        </>
                                    );
                                })()}
                                {(() => {
                                    const hasFilters = searchTerm || (filterCriteria && (
                                        (filterCriteria.category_id && filterCriteria.category_id !== 'all') ||
                                        (filterCriteria.stockStatus && filterCriteria.stockStatus !== 'all') ||
                                        (filterCriteria.sizeRange && (
                                            filterCriteria.sizeRange.min !== 3 || 
                                            filterCriteria.sizeRange.max !== 15
                                        ))
                                    ));
                                    const productsToCount = hasFilters ? filteredProducts : products;
                                    
                                    return (
                                <button
                                    className={`${styles.filterTab} ${stockFilter === 'inactive' ? styles.activeTab : ''}`}
                                    onClick={() => setStockFilter('inactive')}
                                >
                                    ✕ Inactive
                                    <span className={styles.tabCount}>
                                                {productsToCount.filter(p => {
                                            const isActive = p.is_active !== 0 && p.is_active !== false;
                                            return !isActive;
                                        }).length}
                                    </span>
                                </button>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                    <div className={styles.contentSection}>
                        {isLoading ? (
                            <LoadingContainer message="Loading products..." size="medium" />
                        ) : (
                            <AdminProductList
                                products={filteredProducts}
                                allProducts={products}
                                onEdit={handleEditProduct}
                                onImageClick={handleOpenImageModal}
                                onOpenSizesModal={handleOpenSizesModal}
                                onOpenImagesModal={handleOpenImagesModal}
                                isLoading={isLoading}
                                appliedFilters={getAppliedFiltersText()}
                                currency={settings.currency}
                                lowStockThreshold={settings.low_stock_threshold}
                                lowStockPerSizeThreshold={settings.low_stock_threshold_per_size}
                                getStockStatus={getStockStatus}
                                formatPrice={formatPrice}
                            />
                        )}
                    </div>
                </div>
                {showModal && (
                    <AdminProductModal
                        product={selectedProduct}
                        categories={categories}
                        onSave={handleSaveProduct}
                        onClose={handleCloseModal}
                        isNewProduct={isNewProduct}
                        viewMode={false}
                        onOpenSizesModal={handleOpenSizesModal}
                        onOpenImagesModal={handleOpenImagesModal}
                        currency={settings.currency}
                        taxRate={settings.tax_rate}
                        defaultDeliveryCost={settings.default_delivery_cost}
                        freeDeliveryThreshold={settings.free_delivery_threshold}
                    />
                )}
                {showSizesModal && selectedProduct && (
                    <ProductSizesModal
                        product={selectedProduct}
                        onClose={() => setShowSizesModal(false)}
                        onSave={handleSaveSizes}
                        mode="edit"
                    />
                )}
                {showImagesModal && selectedProduct && (
                    <ProductImagesModal
                        product={selectedProduct}
                        onClose={() => setShowImagesModal(false)}
                        onUpload={handleImageUpload}
                        onDelete={handleImageDelete}
                        viewMode={false}
                    />
                )}
                {showFilterModal && (
                    <AdminFilterModal
                        isOpen={showFilterModal}
                        onClose={() => setShowFilterModal(false)}
                        onApplyFilter={handleFilter}
                        initialFilters={filterCriteria}
                        categories={categories}
                        sizeRange={{ min: 3, max: 15 }}
                    />
                )}
                <ImageModal
                    open={imageModalOpen}
                    images={selectedImages}
                    alt={selectedProductName}
                    onClose={handleCloseImageModal}
                />
            </div>
        </ProtectedRoute>
    );
};

export default ProductManagement;
