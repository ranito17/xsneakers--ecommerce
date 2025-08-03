import React, { useState, useEffect } from 'react';
import styles from './imageModal.module.css';

const ImageModal = ({ open, images = [], alt = '', onClose, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        if (open) setCurrentIndex(initialIndex);
    }, [open, initialIndex]);

    if (!open || !images.length) return null;

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };
    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    const handleThumbClick = (idx, e) => {
        e.stopPropagation();
        setCurrentIndex(idx);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close image modal">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                {images.length > 1 && (
                    <>
                        <button className={styles.navButton} style={{left: 0}} onClick={handlePrev} aria-label="Previous image">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15,18 9,12 15,6"/>
                            </svg>
                        </button>
                        <button className={styles.navButton} style={{right: 0}} onClick={handleNext} aria-label="Next image">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9,18 15,12 9,6"/>
                            </svg>
                        </button>
                    </>
                )}
                <img src={images[currentIndex]} alt={alt} className={styles.modalImage} />
                {images.length > 1 && (
                    <>
                        <div className={styles.imageCounter}>{currentIndex + 1} / {images.length}</div>
                        <div className={styles.thumbnailContainer}>
                            {images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={alt + ' thumbnail ' + (idx + 1)}
                                    className={`${styles.thumbnail} ${idx === currentIndex ? styles.activeThumbnail : ''}`}
                                    onClick={(e) => handleThumbClick(idx, e)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageModal; 