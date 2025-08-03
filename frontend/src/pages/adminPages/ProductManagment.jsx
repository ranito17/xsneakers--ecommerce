import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/useAuth';
import Header from '../../components/header/Header';
import NavLinks from '../../components/navLinks/NavLinks';
import Footer from '../../components/footer/Footer';
import ProductModal from '../../components/productModal/ProductModal';
import CategoryModal from '../../components/categoryModal/CategoryModal';
import AdminProductList from '../../components/adminProductList/AdminProductList';
import ProtectedRoute from '../../components/ProtectedRoute';
import { productApi } from '../../services/productApi';
import { categoryApi } from '../../services/categoryApi';

import styles from './adminPages.module.css';

const ProductManagement = () => {
    const { isAuthenticated, isLoading: authLoading, user, checkAuth } = useAuth();
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

    // Check authentication on component mount
    

    // Load products and categories when authenticated
    useEffect(() => {
        
      loadProducts();
            loadCategories();
       
    }, []);

    // Filter products based on search and category
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

        setFilteredProducts(filtered);
    }, [products, searchTerm, selectedCategory]);

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

    const handleAddCategory = () => {
        setShowCategoryModal(true);
    };
    const handleDeleteCategory = async (categoryId) => {
        if (!categoryId) return;
        
        const category = categories.find(c => c.category_id === parseInt(categoryId));
        if (!category) return;
        
        const confirmed = window.confirm(`Are you sure you want to delete the category "${category.category_name}"? This action cannot be undone.`);
        if (!confirmed) return;
        
        try {
            await categoryApi.deleteCategory(categoryId);
            setCategories(prev => prev.filter(c => c.category_id !== parseInt(categoryId)));
            
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
            // The actual upload is now handled by the AdminProductCard component
            // This function is called after successful upload to refresh the product data
            await loadProducts();
        } catch (error) {
            console.error('Error refreshing products after upload:', error);
        }
    };

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className={styles.productLoadingContainer}>
                <div className={styles.productSpinner}></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return (
            <div className={styles.productAccessDenied}>
                <h2>Access Denied</h2>
                <p>You need to be logged in to access this page.</p>
            </div>
        );
    }

    return (
        <ProtectedRoute requiredRole="admin">
            <div className={styles.productManagement}>
                
                <main className={styles.productMainContent}>
                <div className={styles.productPageHeader}>
                    <div className={styles.productHeaderContent}>
                        <div className={styles.productTitleSection}>
                            <h1>Product Management</h1>
                        </div>
                        <p>Manage your store's products, inventory, and pricing</p>
                    </div>
                </div>

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
                            className={styles.addProductButton}
                            onClick={handleAddProduct}
                            disabled={isLoading}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                            Add Product
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
                        <div className={styles.productLoadingState}>
                            <div className={styles.productSpinner}></div>
                            <p>Loading products...</p>
                        </div>
                    ) : (
                        <AdminProductList
                            products={filteredProducts}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                            onImageUpload={handleImageUpload}
                            isLoading={isLoading}
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
                </div>
            </ProtectedRoute>
        );
    };

export default ProductManagement;
