import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../components/common/toast';
import { productApi } from '../../../services/productApi';
import { parseImageUrls, getAbsoluteImageUrl } from '../../../utils/image.utils';
import styles from './productModals.module.css';

const ProductImagesModal = ({ product, onClose, onUpload, onDelete, viewMode = false }) => {
    const { showConfirmation } = useToast();
    const [images, setImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(!viewMode);

    // Load images from product prop
    const loadImages = () => {
        if (product) {
            const imageList = parseImageUrls(product.image_urls || product.images || product.image_url || product.img_url)
                .map(img => getAbsoluteImageUrl(img));
            setImages(imageList);
        } else {
            setImages([]);
        }
    };

    // Refresh product images from server
    const refreshProductImages = useCallback(async () => {
        if (!product?.id) return;
        try {
            const response = await productApi.getProductById(product.id);
            if (response.success && response.data) {
                const updatedProduct = response.data;
                const imageList = parseImageUrls(updatedProduct.image_urls || updatedProduct.images || updatedProduct.image_url || updatedProduct.img_url)
                    .map(img => getAbsoluteImageUrl(img));
                setImages(imageList);
            }
        } catch (error) {
            console.error('Error refreshing product images:', error);
        }
    }, [product?.id]);

    useEffect(() => {
        loadImages();
    }, [product]);

    // Refresh images when modal opens (when product.id changes)
    useEffect(() => {
        if (product?.id) {
            refreshProductImages();
        }
    }, [product?.id, refreshProductImages]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;
        
        setUploading(true);
        try {
            await onUpload(product.id, selectedFiles);
            setSelectedFiles([]);
            // Refresh images from server instead of closing modal
            await refreshProductImages();
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (imageUrl) => {
        const confirmed = await showConfirmation('Are you sure you want to delete this image?');
        if (confirmed) {
            await onDelete(product.id, imageUrl);
            // Refresh images from server instead of just updating local state
            await refreshProductImages();
            // Don't close modal automatically - let user decide when to close
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{isEditing ? 'Manage Images' : 'View Images'} - {product?.name}</h2>
                    <div className={styles.headerActions}>
                        {viewMode && (
                            <button 
                                type="button"
                                onClick={() => setIsEditing(!isEditing)} 
                                className={styles.editToggleButton}
                            >
                                {isEditing ? '👁️ View' : '✏️ Edit'}
                            </button>
                        )}
                        <button onClick={onClose} className={styles.closeButton}>×</button>
                    </div>
                </div>

                <div className={styles.modalBody}>
                    {/* Current Images */}
                    <div className={styles.section}>
                        <h3>Current Images ({images.length})</h3>
                        {images.length === 0 ? (
                            <p className={styles.emptyMessage}>No images uploaded yet</p>
                        ) : (
                            <div className={styles.imageGrid}>
                                {images.map((imageUrl, index) => (
                                    <div key={index} className={styles.imageItem}>
                                        <img 
                                            src={imageUrl} 
                                            alt={`Product ${index + 1}`}
                                            className={styles.thumbnail}
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                        {isEditing && (
                                            <button
                                                onClick={() => handleDelete(imageUrl)}
                                                className={styles.deleteImageButton}
                                                title="Delete image"
                                            >
                                                🗑️ Delete
                                            </button>
                                        )}
                                        {index === 0 && (
                                            <span className={styles.primaryBadge}>Primary</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upload New Images - Only in Edit Mode */}
                    {isEditing && (
                        <div className={styles.section}>
                            <h3>Upload New Images</h3>
                            <div className={styles.uploadArea}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                    className={styles.fileInput}
                                    id="imageUpload"
                                />
                                <label htmlFor="imageUpload" className={styles.fileLabel}>
                                    📁 Choose Images
                                </label>
                                <p className={styles.helpText}>You can select multiple images at once</p>
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className={styles.selectedFiles}>
                                    <h4>Selected Files ({selectedFiles.length})</h4>
                                    <div className={styles.fileList}>
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className={styles.fileItem}>
                                                <span className={styles.fileName}>{file.name}</span>
                                                <span className={styles.fileSize}>
                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                </span>
                                                <button
                                                    onClick={() => removeSelectedFile(index)}
                                                    className={styles.removeFileButton}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleUpload}
                                        className={styles.uploadButton}
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.cancelButton}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductImagesModal;

