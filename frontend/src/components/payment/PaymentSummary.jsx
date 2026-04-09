import React, { useState } from 'react';
import { getProductImage, getProductImages } from '../../utils/image.utils';
import { ImageModal } from '../contactForm';
import styles from './paymentSummary.module.css';

const PaymentSummary = ({ 
    items, 
    formattedSubtotal,
    formattedBaseAmount,
    formattedTaxAmount,
    formattedTaxRate,
    formattedDeliveryCost,
    formattedTotal,
    showFreeDeliveryNote,
    formattedFreeDeliveryAmount
}) => {
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedProductName, setSelectedProductName] = useState('');

    const handleImageClick = (item) => {
        const allImages = getProductImages(item);
        setSelectedImages(allImages.length > 0 ? allImages : [getProductImage(item, '/placeholder.png')]);
        setSelectedProductName(item.name);
        setImageModalOpen(true);
    };

    return (
        <>
        <div className={styles.summarySection}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            
            <div className={styles.summaryItems}>
                {items.map((item) => {
                    const productImageUrl = getProductImage(item, '/placeholder.png');
                    
                    return (
                    <div key={`${item.id}-${item.selected_size || 'no-size'}`} className={styles.summaryItem}>
                        <img 
                                src={productImageUrl} 
                            alt={item.name}
                            className={styles.itemImage}
                                onClick={() => handleImageClick(item)}
                                onError={(e) => {
                                    e.target.src = '/placeholder.png';
                                }}
                        />
                        <div className={styles.itemDetails}>
                            <h4>{item.name}</h4>
                            {item.selected_size && (
                                <p className={styles.itemSize}>Size: {item.selected_size}</p>
                            )}
                            <p className={styles.itemQuantity}>Qty: {item.quantity || 1}</p>
                        </div>
                        <div className={styles.itemPrice}>
                            {item.formattedPrice}
                        </div>
                    </div>
                    );
                })}
            </div>

            <div className={styles.summaryDivider}></div>

            <div className={styles.summaryTotals}>
                <div className={styles.summaryRow}>
                    <span>Subtotal (incl. tax):</span>
                    <span>{formattedSubtotal}</span>
                </div>
                <div className={styles.summaryRowDetail}>
                    <span>  └ Base amount:</span>
                    <span>{formattedBaseAmount}</span>
                </div>
                <div className={styles.summaryRowDetail}>
                    <span>  └ Tax included ({formattedTaxRate}):</span>
                    <span>{formattedTaxAmount}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span>Delivery:</span>
                    <span>{formattedDeliveryCost}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>Total:</span>
                    <span>{formattedTotal}</span>
                </div>
            </div>

            {showFreeDeliveryNote && formattedFreeDeliveryAmount && (
                <div className={styles.freeDeliveryNote}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    Add {formattedFreeDeliveryAmount} more for FREE delivery
                </div>
            )}
        </div>

        {/* Image Modal */}
        <ImageModal
            open={imageModalOpen}
            images={selectedImages}
            alt={selectedProductName}
            onClose={() => setImageModalOpen(false)}
        />
        </>
    );
};

export default PaymentSummary;

