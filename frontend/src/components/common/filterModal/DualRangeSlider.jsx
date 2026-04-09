import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './dualRangeSlider.module.css';

/**
 * DualRangeSlider Component
 * A two-point slider that allows selecting a range between min and max values
 * Points cannot collide or exceed each other
 */
const DualRangeSlider = ({ 
    min, 
    max, 
    step = 1, 
    minValue, 
    maxValue, 
    onChange,
    label = '',
    formatValue = (value) => value
}) => {
    const [minVal, setMinVal] = useState(minValue);
    const [maxVal, setMaxVal] = useState(maxValue);
    const [isDraggingMin, setIsDraggingMin] = useState(false);
    const [isDraggingMax, setIsDraggingMax] = useState(false);
    const [activeThumb, setActiveThumb] = useState(null); // 'min' or 'max'
    const minValRef = useRef(null);
    const maxValRef = useRef(null);
    const range = useRef(null);

    // Convert value to percentage for positioning
    const getPercent = useCallback(
        (value) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    // Set initial values
    useEffect(() => {
        if (minValue !== undefined && maxValue !== undefined) {
            setMinVal(minValue);
            setMaxVal(maxValue);
        }
    }, [minValue, maxValue]);

    // Update range bar when minVal changes
    useEffect(() => {
        if (maxValRef.current) {
            const minPercent = getPercent(minVal);
            const maxPercent = getPercent(+maxValRef.current.value);

            if (range.current) {
                range.current.style.left = `${minPercent}%`;
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [minVal, getPercent]);

    // Update range bar when maxVal changes
    useEffect(() => {
        if (minValRef.current) {
            const minPercent = getPercent(+minValRef.current.value);
            const maxPercent = getPercent(maxVal);

            if (range.current) {
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [maxVal, getPercent]);

    // Handle min value change - prevent collision
    const handleMinChange = (e) => {
        const value = Math.min(+e.target.value, maxVal - step);
        setMinVal(value);
        e.target.value = value.toString();
    };

    // Handle max value change - prevent collision
    const handleMaxChange = (e) => {
        const value = Math.max(+e.target.value, minVal + step);
        setMaxVal(value);
        e.target.value = value.toString();
    };

    // Handle min thumb mouse down
    const handleMinMouseDown = () => {
        setIsDraggingMin(true);
        setActiveThumb('min');
    };

    // Handle max thumb mouse down
    const handleMaxMouseDown = () => {
        setIsDraggingMax(true);
        setActiveThumb('max');
    };

    // Handle mouse leave from slider area
    const handleMouseLeave = () => {
        if (!isDraggingMin && !isDraggingMax) {
            setActiveThumb(null);
        }
    };

    // Handle mouse up for both thumbs
    const handleMouseUp = useCallback(() => {
        if (isDraggingMin || isDraggingMax) {
            onChange({ min: minVal, max: maxVal });
            setIsDraggingMin(false);
            setIsDraggingMax(false);
        }
    }, [minVal, maxVal, isDraggingMin, isDraggingMax, onChange]);

    // Add global mouse up listener
    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchend', handleMouseUp);
        
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [handleMouseUp]);

    // Calculate z-index for thumbs
    const getMinThumbZIndex = () => {
        if (isDraggingMin) return 6; // Highest when dragging
        if (activeThumb === 'min') return 5; // High when active/hovering
        return 3; // Base level
    };

    const getMaxThumbZIndex = () => {
        if (isDraggingMax) return 6; // Highest when dragging
        if (activeThumb === 'max') return 5; // High when active/hovering
        return 4; // Base level (slightly higher than min by default)
    };

    // Calculate which thumb is closer to a given position
    const getClosestThumb = useCallback((clickPercent) => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxVal);
        
        const distanceToMin = Math.abs(clickPercent - minPercent);
        const distanceToMax = Math.abs(clickPercent - maxPercent);
        
        return distanceToMin <= distanceToMax ? 'min' : 'max';
    }, [minVal, maxVal, getPercent]);

    // Handle click on slider wrapper to determine which thumb to activate
    const handleSliderClick = useCallback((e) => {
        if (isDraggingMin || isDraggingMax) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickPercent = (clickX / rect.width) * 100;
        
        const closest = getClosestThumb(clickPercent);
        setActiveThumb(closest);
    }, [isDraggingMin, isDraggingMax, getClosestThumb]);

    // Determine pointer events for each thumb based on which is closer
    const getMinPointerEvents = () => {
        if (isDraggingMax) return 'none';
        if (isDraggingMin) return 'all';
        if (activeThumb === 'max') return 'none';
        if (activeThumb === 'min') return 'all';
        
        // Default: show min if thumbs are close together and min is on left
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxVal);
        const gap = maxPercent - minPercent;
        
        // If thumbs are close (within 5% of range), prioritize min
        if (gap < 5) {
            return 'all';
        }
        
        return 'none';
    };

    const getMaxPointerEvents = () => {
        if (isDraggingMin) return 'none';
        if (isDraggingMax) return 'all';
        if (activeThumb === 'min') return 'none';
        if (activeThumb === 'max') return 'all';
        
        // Default: show max if thumbs are far apart
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxVal);
        const gap = maxPercent - minPercent;
        
        // If thumbs are far apart, max is default
        if (gap >= 5) {
            return 'all';
        }
        
        return 'none';
    };

    return (
        <div className={styles.sliderContainer}>
            {label && <label className={styles.sliderLabel}>{label}</label>}
            
            <div 
                className={styles.sliderWrapper} 
                onMouseMove={handleSliderClick}
                onMouseDown={handleSliderClick}
                onMouseLeave={handleMouseLeave}
            >
                {/* Min range input */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={minVal}
                    ref={minValRef}
                    onChange={handleMinChange}
                    onMouseDown={handleMinMouseDown}
                    onTouchStart={handleMinMouseDown}
                    className={`${styles.thumb} ${styles.thumbLeft}`}
                    style={{ 
                        zIndex: getMinThumbZIndex(),
                        pointerEvents: getMinPointerEvents()
                    }}
                />
                
                {/* Max range input */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={maxVal}
                    ref={maxValRef}
                    onChange={handleMaxChange}
                    onMouseDown={handleMaxMouseDown}
                    onTouchStart={handleMaxMouseDown}
                    className={`${styles.thumb} ${styles.thumbRight}`}
                    style={{ 
                        zIndex: getMaxThumbZIndex(),
                        pointerEvents: getMaxPointerEvents()
                    }}
                />

                {/* Slider track */}
                <div className={styles.slider}>
                    <div className={styles.sliderTrack} />
                    <div ref={range} className={styles.sliderRange} />
                </div>
            </div>

            {/* Value display */}
            <div className={styles.sliderValues}>
                <div className={`${styles.valueDisplay} ${activeThumb === 'min' ? styles.activeValue : ''}`}>
                    <span className={styles.valueLabel}>Min:</span>
                    <input
                        type="number"
                        min={min}
                        max={maxVal - step}
                        step={step}
                        value={minVal}
                        onChange={(e) => {
                            const value = Math.min(
                                Math.max(Number(e.target.value) || min, min),
                                maxVal - step
                            );
                            setMinVal(value);
                            onChange({ min: value, max: maxVal });
                        }}
                        onBlur={(e) => {
                            const value = Math.min(
                                Math.max(Number(e.target.value) || min, min),
                                maxVal - step
                            );
                            setMinVal(value);
                            onChange({ min: value, max: maxVal });
                        }}
                        className={styles.valueInput}
                    />
                    <span className={styles.formattedValue}>{formatValue(minVal)}</span>
                </div>
                
                <div className={styles.valueSeparator}>—</div>
                
                <div className={`${styles.valueDisplay} ${activeThumb === 'max' ? styles.activeValue : ''}`}>
                    <span className={styles.valueLabel}>Max:</span>
                    <input
                        type="number"
                        min={minVal + step}
                        max={max}
                        step={step}
                        value={maxVal}
                        onChange={(e) => {
                            const value = Math.max(
                                Math.min(Number(e.target.value) || max, max),
                                minVal + step
                            );
                            setMaxVal(value);
                            onChange({ min: minVal, max: value });
                        }}
                        onBlur={(e) => {
                            const value = Math.max(
                                Math.min(Number(e.target.value) || max, max),
                                minVal + step
                            );
                            setMaxVal(value);
                            onChange({ min: minVal, max: value });
                        }}
                        className={styles.valueInput}
                    />
                    <span className={styles.formattedValue}>{formatValue(maxVal)}</span>
                </div>
            </div>
        </div>
    );
};

export default DualRangeSlider;

