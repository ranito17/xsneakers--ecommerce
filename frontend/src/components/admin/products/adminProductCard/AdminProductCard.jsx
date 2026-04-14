import React from 'react';
import styles from './adminProductCard.module.css';
import { formatSizesForAdmin, calculateTotalStock } from '../../../../utils/product.utils';
import { formatPrice } from '../../../../utils/price.utils';
import { parseImageUrls, getAbsoluteImageUrl } from '../../../../utils/image.utils';

const AdminProductCard = ({ 
    product, 
    onEdit, 
    onImageClick,
    onOpenSizesModal,
    onOpenImagesModal,
    // Settings from parent
    currency = 'ILS',
    lowStockThreshold = 10,
    getStockStatus,
    formatPrice: formatPriceProp
}) => {

    const getFirstImageUrl = () => {
        const imageSource = product.image_urls || product.images || product.image_url || product.img_url;
        const parsedImages = parseImageUrls(imageSource);
        return parsedImages.length > 0 ? getAbsoluteImageUrl(parsedImages[0]) : (product.image_url || product.img_url || '');
    };

    const getImageCount = () => {
        const imageSource = product.image_urls || product.images || product.image_url || product.img_url;
        const parsedImages = parseImageUrls(imageSource);
        if (parsedImages.length > 0) {
            return parsedImages.length;
        }
        return product.image_url || product.img_url ? 1 : 0;
    };

    const firstImageUrl = getFirstImageUrl();
    const imageCount = getImageCount();
    
    // Calculate actual total stock from sizes
    const totalStock = calculateTotalStock(product.sizes, product.stock_quantity);
    
    // Get size count
    const getSizeCount = () => {
        if (product.sizes) {
            let sizes;
            try {
                sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
            } catch (e) {
                return 0;
            }
            return Array.isArray(sizes) ? sizes.length : 0;
        }
        return 0;
    };
    
    const sizeCount = getSizeCount();

    // Determine product status based on is_active field
    const isActive = product.is_active !== 0 && product.is_active !== false;
    const statusBadge = isActive ? 'active' : 'inactive';

    return (
        <div 
            className={`${styles.productCard} ${styles[statusBadge]}`}
            onClick={() => onEdit(product)}
            style={{ cursor: 'pointer' }}
        >
            {/* Header with Image */}
            <div className={styles.cardHeader}>
                <div className={styles.productImage}>
                    {firstImageUrl ? (
                        <img 
                            src={firstImageUrl} 
                            alt={product.name}
                            onClick={(e) => {
                                e.stopPropagation();
                                const imageSource = product.image_urls || product.images || product.image_url || product.img_url;
                                onImageClick && onImageClick(imageSource, product.name);
                            }}
                            style={{ cursor: onImageClick ? 'pointer' : 'default' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className={styles.imagePlaceholder} style={{ display: firstImageUrl ? 'none' : 'flex' }}>
                        <span>No Image</span>
                    </div>
                </div>
                
                {/* Status Badge */}
                <div className={`${styles.statusBadge} ${styles[statusBadge]}`}>
                    {isActive ? 'Active' : 'Inactive'}
                </div>
            </div>

            {/* Content */}
            <div className={styles.cardContent}>
                <h3 className={styles.productName}>{product.name}</h3>
                
                {/* Product Info Section */}
                <div className={styles.productInfo}>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Price:</span>
                        <span className={`${styles.value} ${styles.price}`}>
                            {formatPriceProp ? formatPriceProp(product.price, currency) : formatPrice(product.price, currency)}
                        </span>
                    </div>
                    
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Category:</span>
                        <span className={`${styles.value} ${styles.categoryName}`}>
                            {product.category_name || 'Uncategorized'}
                        </span>
                    </div>
                    
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Total Stock:</span>
                        <span className={`${styles.value} ${styles.stockQuantity}`}>
                            {totalStock} units
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminProductCard; 