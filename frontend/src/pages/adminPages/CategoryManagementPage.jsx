// CategoryManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuthentication';
import { useToast } from '../../components/common/toast';
import { categoryApi } from '../../services/categoryApi';
import { CategoryModal, CategoryList } from '../../components/admin/categories';
import { ImageModal, LoadingContainer, ErrorContainer } from '../../components/contactForm';
import { SearchBar } from '../../components/admin/common';
import ProtectedRoute from '../../components/ProtectedRoute';
import styles from './adminPages.module.css';

const CategoryManagementPage = () => {
    const { isAuthenticated, user } = useAuth();
    const { showError, showSuccess, showConfirmation } = useToast();
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [formData, setFormData] = useState({
        category_name: '',
        description: '',
        image_url: null
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // loadCategories - טוען את כל הקטגוריות מהשרת
    // שליחה לשרת: getCategories()
    // תגובה מהשרת: { data: [...] }
    const loadCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await categoryApi.getCategories();
            setCategories(response.data || []);
        } catch (err) {
            console.error('Error loading categories:', err);
            setError('Failed to load categories. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);


    // handleSaveCategory - יוצר או מעדכן קטגוריה
    // שליחה לשרת: addCategory(data) או updateCategory(id, data), uploadCategoryImage(id, file)
    // תגובה מהשרת: { success: true, data: {...} } או { success: true }
    const handleSaveCategory = async (data, file) => {
        try {
            if (isNewCategory) {
                const response = await categoryApi.addCategory({
                    category_name: data.category_name,
                    description: data.description,
                    image_url: null
                });
                const savedCategory = response.data;
                if (file && savedCategory.category_id) {
                    await categoryApi.uploadCategoryImage(savedCategory.category_id, file);
                }
                await loadCategories();
                showSuccess(`Category "${data.category_name}" created successfully!`);
            } else {
                const updateData = {
                    category_name: data.category_name,
                    description: data.description
                };
                if (file) {
                    await categoryApi.uploadCategoryImage(selectedCategory.category_id, file);
                }
                await categoryApi.updateCategory(selectedCategory.category_id, updateData);
                await loadCategories();
                showSuccess(`Category "${data.category_name}" updated successfully!`);
            }
            setShowModal(false);
            setFormData({ category_name: '', description: '', image_url: null });
            setImageFile(null);
            setImagePreview(null);
        } catch (err) {
            console.error('Error saving category:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to save category. Please try again.';
            showError(errorMessage);
            throw new Error(errorMessage);
        }
    };


    // handleDeactivateCategory - משבית קטגוריה וכל מוצריה
    // שליחה לשרת: deactivateCategory(categoryId)
    // תגובה מהשרת: { success: true, data: { deactivatedProducts } }
    const handleDeactivateCategory = async (categoryId) => {
        const category = categories.find(c => c.category_id === categoryId);
        const categoryName = category?.category_name || 'this category';
        const confirmed = await showConfirmation(
            `Deactivate category "${categoryName}"? All products in this category will also be deactivated.`
        );
        if (!confirmed) {
            return;
        }
        try {
            const result = await categoryApi.deactivateCategory(categoryId);
            if (result.success) {
                await loadCategories();
                const deactivatedProducts = result.data?.deactivatedProducts || 0;
                showSuccess(`Category "${categoryName}" deactivated. ${deactivatedProducts} product${deactivatedProducts !== 1 ? 's' : ''} ${deactivatedProducts > 0 ? 'were' : 'was'} deactivated.`);
            }
        } catch (err) {
            console.error('Error deactivating category:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to deactivate category. Please try again.';
            showError(errorMessage);
        }
    };

    // handleActivateCategory - מפעיל קטגוריה וכל מוצריה
    // שליחה לשרת: activateCategory(categoryId)
    // תגובה מהשרת: { success: true, data: { activatedProducts } }
    const handleActivateCategory = async (categoryId) => {
        const category = categories.find(c => c.category_id === categoryId);
        const categoryName = category?.category_name || 'this category';
        const confirmed = await showConfirmation(
            `Activate category "${categoryName}"? All products in this category will also be activated.`
        );
        if (!confirmed) {
            return;
        }
        try {
            const result = await categoryApi.activateCategory(categoryId);
            if (result.success) {
                await loadCategories();
                const activatedProducts = result.data?.activatedProducts || 0;
                showSuccess(`Category "${categoryName}" activated. ${activatedProducts} product${activatedProducts !== 1 ? 's' : ''} ${activatedProducts > 0 ? 'were' : 'was'} activated.`);
            }
        } catch (err) {
            console.error('Error activating category:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to activate category. Please try again.';
            showError(errorMessage);
        }
    };


    // handleImageDelete - מוחק תמונת קטגוריה
    // שליחה לשרת: deleteCategoryImage(categoryId, imageUrl)
    // תגובה מהשרת: { success: true }
    const handleImageDelete = async (categoryId, imageUrl) => {
        try {
            await categoryApi.deleteCategoryImage(categoryId, imageUrl);
            await loadCategories();
        } catch (err) {
            console.error('Error deleting category image:', err);
            throw new Error(err.response?.data?.message || 'Failed to delete image. Please try again.');
        }
    };


    // handleAddCategory - פותח מודל יצירת קטגוריה חדשה
    const handleAddCategory = () => {
        setSelectedCategory(null);
        setIsNewCategory(true);
        setFormData({
            category_name: '',
            description: '',
            image_url: null
        });
        setImageFile(null);
        setImagePreview(null);
        setShowModal(true);
    };


    // handleEditCategory - פותח מודל עריכת קטגוריה
    const handleEditCategory = (category) => {
        setSelectedCategory(category);
        setIsNewCategory(false);
        let imageUrl = null;
        if (category.image_urls) {
            try {
                const parsedUrls = JSON.parse(category.image_urls);
                imageUrl = Array.isArray(parsedUrls) && parsedUrls.length > 0 ? parsedUrls[0] : null;
            } catch {
                imageUrl = category.image_urls;
            }
        }
        setFormData({
            category_name: category.category_name,
            description: category.description || '',
            image_url: imageUrl
        });
        setImageFile(null);
        setImagePreview(imageUrl);
        setShowModal(true);
    };


    // handleCloseModal - סוגר את מודל הקטגוריה
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCategory(null);
        setIsNewCategory(false);
        setFormData({ category_name: '', description: '', image_url: null });
        setImageFile(null);
        setImagePreview(null);
    };


    // handleOpenImageModal - פותח מודל תצוגת תמונה
    const handleOpenImageModal = (imageUrl, categoryName) => {
        setSelectedImage(imageUrl);
        setSelectedCategoryName(categoryName);
        setImageModalOpen(true);
    };


    // handleCloseImageModal - סוגר מודל תצוגת תמונה
    const handleCloseImageModal = () => {
        setImageModalOpen(false);
        setSelectedImage('');
        setSelectedCategoryName('');
    };


    // handleSearchChange - מעדכן את מילת החיפוש
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };


    // handleClearSearch - מנקה את מילת החיפוש
    const handleClearSearch = () => {
        setSearchTerm('');
    };


    // handleImageChange - מעדכן תמונה נבחרת
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };


    // handleRemoveImage - מסיר תמונה מקטגוריה
    const handleRemoveImage = async () => {
        if (!isNewCategory && formData.image_url) {
            try {
                await handleImageDelete(selectedCategory.category_id, formData.image_url);
                setFormData({ ...formData, image_url: null });
                setImagePreview(null);
                setImageFile(null);
            } catch (err) {
                console.error('Error removing image:', err);
                showError(err.message || 'Failed to remove image. Please try again.');
            }
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };


    useEffect(() => {
        if (isAuthenticated && user) {
            loadCategories();
        }
    }, [isAuthenticated, user, loadCategories]);


    useEffect(() => {
        let filtered = categories;
        if (searchTerm) {
            filtered = filtered.filter(category =>
                category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredCategories(filtered);
    }, [categories, searchTerm]);
    if (error && !isLoading) {
        return (
            <ProtectedRoute requiredRole="admin">
                <ErrorContainer
                    message={error}
                    onRetry={loadCategories}
                    showRetry={true}
                />
            </ProtectedRoute>
        );
    }
    return (
        <ProtectedRoute requiredRole="admin">
            <div className={styles.categoryManagement}>
                <div className={styles.categoryMainContent}>
                    <div className={styles.productFilterInfo}>
                        <SearchBar
                            count={filteredCategories.length}
                            itemName="category"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onClear={handleClearSearch}
                        />
                        <div className={styles.productControlsRight}>
                            <button
                                className={styles.categoryAddButton}
                                onClick={handleAddCategory}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Add Category
                            </button>
                        </div>
                    </div>
                    <div className={styles.contentSection}>
                        {isLoading ? (
                            <LoadingContainer message="Loading categories..." size="medium" />
                        ) : (
                                <CategoryList
                                categories={filteredCategories}
                                onEdit={handleEditCategory}
                                onDeactivate={handleDeactivateCategory}
                                onActivate={handleActivateCategory}
                                onImageClick={handleOpenImageModal}
                                searchTerm={searchTerm}
                                />
                        )}
                    </div>
                </div>
                {showModal && (
                    <CategoryModal
                        category={selectedCategory}
                        onSave={handleSaveCategory}
                        onClose={handleCloseModal}
                        onImageDelete={handleImageDelete}
                        isLoading={false}
                    />
                )}
                <ImageModal
                    open={imageModalOpen}
                    images={selectedImage ? [selectedImage] : []}
                    alt={selectedCategoryName}
                    onClose={handleCloseImageModal}
                />
            </div>
        </ProtectedRoute>
    );
};

export default CategoryManagementPage;
