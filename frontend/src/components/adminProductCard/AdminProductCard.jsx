import React, { useState } from 'react';
import { uploadApi } from '../../services/uploadApi';
import styles from './adminProductCard.module.css';

const AdminProductCard = ({ product, onEdit, onDelete, onImageUpload }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState(null);

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await onDelete();
        } catch (error) {
            console.error('Error deleting product:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const getStockStatus = (quantity) => {
        if (quantity === 0) return { status: 'out-of-stock', label: 'Out of Stock', color: '#e53e3e' };
        if (quantity <= 5) return { status: 'low-stock', label: 'Low Stock', color: '#d69e2e' };
        return { status: 'in-stock', label: 'In Stock', color: '#38a169' };
    };

    const stockInfo = getStockStatus(product.stock_quantity);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        const errors = [];

        files.forEach(file => {
            const validation = uploadApi.validateFile(file);
            if (validation.isValid) {
                validFiles.push(file);
            } else {
                errors.push(`${file.name}: ${validation.error}`);
            }
        });

        if (errors.length > 0) {
            alert(`Invalid files:\n${errors.join('\n')}`);
        }

        if (validFiles.length + selectedFiles.length > 10) {
            alert('You can only upload up to 10 images');
            return;
        }

        setSelectedFiles(prev => [...prev, ...validFiles]);
        setUploadError(null);
    };

    const handleUploadImages = async () => {
        if (selectedFiles.length === 0) return;
        
        setIsUploading(true);
        setUploadProgress(0);
        setUploadError(null);
        
        try {
            await uploadApi.uploadProductImages(
                product.id, 
                selectedFiles, 
                (progress) => setUploadProgress(progress)
            );
            
            setSelectedFiles([]);
            setUploadProgress(0);
            
            // Refresh the product data
            if (onImageUpload) {
                await onImageUpload(product.id, selectedFiles);
            }
            
        } catch (error) {
            console.error('Error uploading images:', error);
            setUploadError(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={`${styles.productCard} ${styles[stockInfo.status]}`}>
            <div className={styles.cardHeader}>
                <div className={styles.productImage}>
                    {product.image_urls ? (
                        <img 
                            src={product.image_urls.split(',')[0]} 
                            alt={product.name}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={styles.imagePlaceholder}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="M21 15l-5-5L5 21"/>
                        </svg>
                    </div>
                </div>
                
                <div className={styles.stockBadge} style={{ backgroundColor: stockInfo.color }}>
                    {stockInfo.label}
                </div>
            </div>

            <div className={styles.cardContent}>
                <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productDescription}>
                        {product.description || 'No description available'}
                    </p>
                </div>

                <div className={styles.productDetails}>
                    <div className={styles.priceSection}>
                        <span className={styles.price}>{formatPrice(product.price)}</span>
                        <span className={styles.stockQuantity}>
                            Stock: {product.stock_quantity}
                        </span>
                    </div>

                    <div className={styles.categoryInfo}>
                        <span className={styles.categoryLabel}>Category:</span>
                        <span className={styles.categoryName}>
                            {product.category_name || 'Uncategorized'}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.cardActions}>
                <button 
                    className={styles.editButton}
                    onClick={onEdit}
                    disabled={isDeleting || isUploading}
                    title="Edit Product"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                </button>

                <button 
                    className={styles.deleteButton}
                    onClick={handleDelete}
                    disabled={isDeleting || isUploading}
                    title="Delete Product"
                >
                    {isDeleting ? (
                        <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                            </circle>
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    )}
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>

            {/* Image Upload Section */}
            <div className={styles.imageUploadSection}>
                <div className={styles.uploadHeader}>
                    <h4>Product Images</h4>
                    <span className={styles.uploadCount}>
                        {selectedFiles.length}/10 selected
                    </span>
                </div>
                
                <div className={styles.uploadControls}>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className={styles.fileInput}
                        id={`file-input-${product.id}`}
                        disabled={isUploading}
                    />
                    <label 
                        htmlFor={`file-input-${product.id}`}
                        className={styles.fileInputLabel}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Select Images
                    </label>
                    
                    {selectedFiles.length > 0 && (
                        <button 
                            className={styles.uploadButton}
                            onClick={handleUploadImages}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                                            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                                        </circle>
                                    </svg>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="7,10 12,15 17,10"/>
                                        <line x1="12" y1="15" x2="12" y2="3"/>
                                    </svg>
                                    Upload {selectedFiles.length} Image{selectedFiles.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                    <div className={styles.uploadProgress}>
                        <div className={styles.progressBar}>
                            <div 
                                className={styles.progressFill} 
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <span className={styles.progressText}>{uploadProgress}%</span>
                    </div>
                )}

                {/* Upload Error */}
                {uploadError && (
                    <div className={styles.uploadError}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        {uploadError}
                    </div>
                )}

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                    <div className={styles.selectedFilesPreview}>
                        {selectedFiles.map((file, index) => (
                            <div key={index} className={styles.filePreview}>
                                <img 
                                    src={URL.createObjectURL(file)} 
                                    alt={`Preview ${index + 1}`}
                                    className={styles.previewImage}
                                />
                                <button 
                                    className={styles.removeFileButton}
                                    onClick={() => removeSelectedFile(index)}
                                    title="Remove file"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                                <span className={styles.fileName}>{file.name}</span>
                                <span className={styles.fileSize}>
                                    {uploadApi.formatFileSize(file.size)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.productId}>
                    ID: {product.id}
                </div>
                <div className={styles.lastUpdated}>
                    {product.updated_at ? (
                        `Updated: ${new Date(product.updated_at).toLocaleDateString()}`
                    ) : (
                        `Created: ${new Date(product.created_at || Date.now()).toLocaleDateString()}`
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProductCard; 