import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuthentication';

import ProductModal from '../../components/productModal/ProductModal';
import CategoryModal from '../../components/categoryModal/CategoryModal';
import AdminProductList from '../../components/adminProductList/AdminProductList';
import FilterModal from '../../components/filterModal/FilterModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import LoadingContainer from '../../components/loading/LoadingContainer';
import ErrorContainer from '../../components/error/ErrorContainer';
import { productApi } from '../../services/productApi';
import { categoryApi } from '../../services/categoryApi';

import styles from './adminPages.module.css';

const ProductManagement = () => {
    const { isAuthenticated, user } = useAuth();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState('');
    const [categories, setCategories] = useState([]);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);
    const [filterCriteria, setFilterCriteria] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Check authentication on component mount
    

    // Load products and categories when authenticated
    useEffect(() => {
        // Only load data if user is authenticated
        if (isAuthenticated && user) {
            loadProducts();
            loadCategories();
        }
    }, [isAuthenticated, user]);

    // Filter products based on search, category, and advanced filters
    useEffect(() => {
        let filtered = products;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => 
                product.category_id === parseInt(selectedCategory)
            );
        }

        // Apply advanced filters
        if (filterCriteria) {
            // Filter by color
            if (filterCriteria.color) {
                filtered = filtered.filter(product =>
                    product.color && product.color.toLowerCase().includes(filterCriteria.color.toLowerCase())
                );
            }

            // Apply multiple filters
            if (filterCriteria.filters && filterCriteria.filters.length > 0) {
                filtered = filtered.filter(product => {
                    return filterCriteria.filters.every(filter => {
                        let productValue = product[filter.field];
                        const filterValue = parseFloat(filter.value);
                        const filterValue2 = filter.value2 ? parseFloat(filter.value2) : null;

                        // Handle sizes array specially
                        if (filter.field === 'sizes') {
                            // Parse sizes if it's a string, or use as is if it's already an array
                            let sizes = productValue;
                            if (typeof sizes === 'string') {
                                try {
                                    sizes = JSON.parse(sizes);
                                } catch (e) {
                                    sizes = [];
                                }
                            }
                            
                            if (!Array.isArray(sizes)) {
                                sizes = [];
                            }

                            // Check if any size in the array matches the filter criteria
                            switch (filter.operator) {
                                case 'gte':
                                    return sizes.some(size => parseFloat(size) >= filterValue);
                                case 'lte':
                                    return sizes.some(size => parseFloat(size) <= filterValue);
                                case 'eq':
                                    return sizes.some(size => parseFloat(size) === filterValue);
                                case 'range':
                                    return sizes.some(size => {
                                        const sizeNum = parseFloat(size);
                                        return sizeNum >= filterValue && sizeNum <= filterValue2;
                                    });
                                default:
                                    return true;
                            }
                        } else {
                            // Handle other numeric fields (price, stock_quantity)
                            productValue = parseFloat(productValue);
                            
                            switch (filter.operator) {
                                case 'gte':
                                    return productValue >= filterValue;
                                case 'lte':
                                    return productValue <= filterValue;
                                case 'eq':
                                    return productValue === filterValue;
                                case 'range':
                                    return productValue >= filterValue && productValue <= filterValue2;
                                default:
                                    return true;
                            }
                        }
                    });
                });
            }
        }

        setFilteredProducts(filtered);
    }, [products, searchTerm, selectedCategory, filterCriteria]);

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

    const loadCategories = useCallback(async () => {
        try {
            console.log('Loading categories...');
            const response = await categoryApi.getCategories();
            console.log('Categories response:', response);
            setCategories(response.data || []);
            console.log('Categories set:', response.data || []);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    }, []);

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsNewProduct(true);
        setShowModal(true);
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setIsNewProduct(false);
        setShowModal(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            await productApi.deleteProduct(productId);
            setProducts(prev => prev.filter(p => p.id !== productId));
        } catch (err) {
            console.error('Error deleting product:', err);
            setError('Failed to delete product. Please try again.');
        }
    };

    const handleSaveProduct = async (productData) => {
        try {
            if (isNewProduct) {
                const response = await productApi.createProduct(productData);
                const newProduct = { ...productData, id: response.productId };
                setProducts(prev => [...prev, newProduct]);
            } else {
                await productApi.updateProduct(selectedProduct.id, productData);
                setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, ...productData } : p));
            }
            setShowModal(false);
        } catch (err) {
            console.error('Error saving product:', err);
            throw new Error('Failed to save product. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
        setIsNewProduct(false);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleFilter = (criteria) => {
        setFilterCriteria(criteria);
    };

    const getAppliedFiltersText = () => {
        if (!filterCriteria) return '';
        
        const filters = [];
        
        if (filterCriteria.color) {
            filters.push(`Color: ${filterCriteria.color}`);
        }
        
        if (filterCriteria.filters && filterCriteria.filters.length > 0) {
            filterCriteria.filters.forEach(filter => {
                const operatorText = {
                    'gte': '≥',
                    'lte': '≤',
                    'eq': '=',
                    'range': 'between'
                }[filter.operator] || filter.operator;
                
                // Format field name for display
                const fieldDisplayName = {
                    'price': 'Price',
                    'stock_quantity': 'Stock Quantity',
                    'sizes': 'Sizes'
                }[filter.field] || filter.field;
                
                if (filter.operator === 'range' && filter.value2) {
                    filters.push(`${fieldDisplayName} ${operatorText} ${filter.value}-${filter.value2}`);
                } else {
                    filters.push(`${fieldDisplayName} ${operatorText} ${filter.value}`);
                }
            });
        }
        
        return filters.join(', ');
    };

    const handleAddCategory = () => {
        setShowCategoryModal(true);
    };
    const handleDeleteCategory = async (categoryId) => {
        if (!categoryId) return;
        
        const category = categories.find(c => c.category_id === parseInt(categoryId));
        if (!category) return;
        
        // Get products count for this category
        const productsInCategory = products.filter(p => p.category_id === parseInt(categoryId));
        const productCount = productsInCategory.length;
        
        let confirmMessage = `Are you sure you want to delete the category "${category.category_name}"?`;
        if (productCount > 0) {
            confirmMessage += `\n\n⚠️ WARNING: This will also delete ${productCount} product${productCount === 1 ? '' : 's'} in this category. This action cannot be undone.`;
        } else {
            confirmMessage += '\n\nThis action cannot be undone.';
        }
        
        const confirmed = window.confirm(confirmMessage);
        if (!confirmed) return;
        
        try {
            const response = await categoryApi.deleteCategory(categoryId);
            
            // Show success message with product count
            if (response.success) {
                const deletedProducts = response.data?.deletedProducts || 0;
                let successMessage = `Category "${category.category_name}" deleted successfully.`;
                if (deletedProducts > 0) {
                    successMessage += `\n${deletedProducts} product${deletedProducts === 1 ? '' : 's'} also deleted.`;
                }
                alert(successMessage);
            }
            
            // Update categories list
            setCategories(prev => prev.filter(c => c.category_id !== parseInt(categoryId)));
            
            // Update products list - remove products from deleted category
            setProducts(prev => prev.filter(p => p.category_id !== parseInt(categoryId)));
            
            // Reset the delete selection
            setSelectedCategoryToDelete('');
            
            // If the deleted category was selected in filter, reset to "all"
            if (selectedCategory === categoryId) {
                setSelectedCategory('all');
            }
        } catch (err) {
            console.error('Error deleting category:', err);
            setError('Failed to delete category. Please try again.');
        }
    };

    const handleSaveCategory = async (categoryData) => {
        setIsCategoryLoading(true);
        try {
            const response = await categoryApi.addCategory(categoryData);
            const newCategory = response.data;
            
            // Add the new category to the list
            setCategories(prev => [...prev, newCategory]);
            
            // Close the modal
            setShowCategoryModal(false);
            
            // Show success message (you can add a toast notification here)
            console.log('Category added successfully:', newCategory);
        } catch (err) {
            console.error('Error adding category:', err);
            throw new Error(err.response?.data?.message || 'Failed to add category');
        } finally {
            setIsCategoryLoading(false);
        }
    };

    const handleCloseCategoryModal = () => {
        setShowCategoryModal(false);
    };

    const handleImageUpload = async (productId, files) => {
        try {
            // Refresh the products list to get updated image URLs
            await loadProducts();
        } catch (err) {
            console.error('Error refreshing products after image upload:', err);
        }
    };

    const handleImageDelete = async (productId, imageUrl) => {
        try {
            // Refresh the products list to get updated image URLs
            await loadProducts();
        } catch (err) {
            console.error('Error refreshing products after image deletion:', err);
        }
    };

    // Note: Authentication is now handled by ProtectedRoute component

    return (
        <ProtectedRoute requiredRole="admin">
            <div className={styles.productManagement}>
                
                <main className={styles.productMainContent}>
              

                <div className={styles.categoryManagementSection}>
                    <div className={styles.productHeaderContent}>
                        <div className={styles.productTitleSection}>
                            <h1>Category Management</h1>
                        </div>
                        <p>Add, edit, and manage product categories</p>
                    </div>
                    <div className={styles.productCategoryActions}>
                        <button 
                            className={styles.addCategoryButton}
                            onClick={handleAddCategory}
                            disabled={isLoading}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                            Add Category
                        </button>
                        
                        <button 
                            className={styles.addProductButton}
                            onClick={handleAddProduct}
                            title="Add new product"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                            Add Product
                        </button>
                        
                        <div className={styles.deleteCategorySection}>
                            <select 
                                value={selectedCategoryToDelete || ''} 
                                onChange={(e) => setSelectedCategoryToDelete(e.target.value)}
                                className={styles.deleteCategorySelect}
                            >
                                <option value="">Select Category to Delete</option>
                                {categories.map(category => (
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                            <button 
                                className={styles.deleteCategoryButton}
                                onClick={() => handleDeleteCategory(selectedCategoryToDelete)}
                                disabled={!selectedCategoryToDelete || isLoading}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.productFiltersSection}>
                    <div className={styles.productSearchContainer}>
                        <div className={styles.productSearchInput}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className={styles.productSearchField}
                            />
                        </div>
                    </div>

                    <div className={styles.productFilterControls}>
                        <div className={styles.productCategorySection}>
                            <select 
                                value={selectedCategory} 
                                onChange={handleCategoryChange}
                                className={styles.productCategoryFilter}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button 
                            className={styles.filterButton}
                            onClick={() => setShowFilterModal(true)}
                            title="Open filter options"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 4h18M7 8h10M9 12h6M11 16h2"/>
                            </svg>
                            Filter
                        </button>
                    </div>
                </div>

                <div className={styles.productContentArea}>
                    {error && (
                        <div className={styles.productErrorMessage}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 002.18 2.18L20.14 9.71a2 2 0 00-2.18-2.18z"/>
                                <path d="M12 9v4M12 17h.01"/>
                            </svg>
                            {error}
                            <button onClick={() => setError(null)} className={styles.productDismissError}>
                                ×
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <LoadingContainer message="Loading products..." size="medium" />
                    ) : (
                        <AdminProductList
                            products={filteredProducts}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                            onImageUpload={handleImageUpload}
                            onImageDelete={handleImageDelete}
                            isLoading={isLoading}
                            appliedFilters={getAppliedFiltersText()}
                        />
                    )}
                </div>
            </main>

           

            {showModal && (
                <ProductModal
                    product={selectedProduct}
                    categories={categories}
                    onSave={handleSaveProduct}
                    onClose={handleCloseModal}
                    isNewProduct={isNewProduct}
                    onDelete={selectedProduct ? () => handleDeleteProduct(selectedProduct.id) : null}
                />
            )}

            {showCategoryModal && (
                <CategoryModal
                    onSave={handleSaveCategory}
                    onClose={handleCloseCategoryModal}
                    isLoading={isCategoryLoading}
                />
            )}

            {showFilterModal && (
                <FilterModal
                    isOpen={showFilterModal}
                    onClose={() => setShowFilterModal(false)}
                    onApplyFilter={handleFilter}
                    initialFilters={filterCriteria}
                />
            )}
                </div>
            </ProtectedRoute>
        );
    };

export default ProductManagement;
