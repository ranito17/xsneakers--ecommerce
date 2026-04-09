/**
 * כלי עזר לחישובי מחיר - Price Calculation Utilities
 * 
 * מיקום מרכזי לכל חישובי המחיר, מס ומשלוח.
 * 
 * כלל עסקי חשוב:
 * - מחירי המוצרים במסד הנתונים כוללים מס
 * - בעת הצגת פירוט הזמנה, אנו מחלצים את סכום המס כדי להציג שקיפות
 * - עלות משלוח מחושבת בנפרד ומוספת לסך הכל
 */

// ============================================================================
// חישובי מס - TAX CALCULATIONS
// ============================================================================

/**
 * מחלץ את סכום המס ממחיר שכולל מס
 * נוסחה: tax = price - (price / (1 + taxRate))
 * 
 * @param {number} priceIncludingTax - המחיר שכולל מס
 * @param {number} taxRate - שיעור מס כעשרוני (למשל, 0.09 עבור 9%)
 * @returns {number} סכום המס הכלול במחיר
 * 
 * דוגמה: extractTaxFromPrice(100, 0.09) = 8.26
 * כי 100 / 1.09 = 91.74 (בסיס), אז מס = 100 - 91.74 = 8.26
 */
export const extractTaxFromPrice = (priceIncludingTax, taxRate) => {
    if (!priceIncludingTax || priceIncludingTax <= 0) return 0;
    if (!taxRate || taxRate <= 0) return 0;
    
    const priceWithoutTax = priceIncludingTax / (1 + taxRate);
    const taxAmount = priceIncludingTax - priceWithoutTax;
    
    return taxAmount;
};

/**
 * מקבל את מחיר הבסיס (ללא מס) ממחיר שכולל מס
 * נוסחה: basePrice = price / (1 + taxRate)
 * 
 * @param {number} priceIncludingTax - המחיר שכולל מס
 * @param {number} taxRate - שיעור מס כעשרוני (למשל, 0.09 עבור 9%)
 * @returns {number} מחיר הבסיס ללא מס
 * 
 * דוגמה: getBasePriceFromInclusive(100, 0.09) = 91.74
 */
export const getBasePriceFromInclusive = (priceIncludingTax, taxRate) => {
    if (!priceIncludingTax || priceIncludingTax <= 0) return 0;
    if (!taxRate || taxRate <= 0) return priceIncludingTax;
    
    return priceIncludingTax / (1 + taxRate);
};

/**
 * Calculate tax amount from a base price
 * Formula: tax = basePrice * taxRate
 * 
 * @param {number} basePrice - The price without tax
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.09 for 9%)
 * @returns {number} The tax amount to add
 * 
 * Example: calculateTaxFromBasePrice(91.74, 0.09) = 8.26
 */
export const calculateTaxFromBasePrice = (basePrice, taxRate) => {
    if (!basePrice || basePrice <= 0) return 0;
    if (!taxRate || taxRate <= 0) return 0;
    
    return basePrice * taxRate;
};

/**
 * Add tax to a base price
 * Formula: totalPrice = basePrice * (1 + taxRate)
 * 
 * @param {number} basePrice - The price without tax
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.09 for 9%)
 * @returns {number} The price including tax
 * 
 * Example: addTaxToBasePrice(91.74, 0.09) = 100
 */
export const addTaxToBasePrice = (basePrice, taxRate) => {
    if (!basePrice || basePrice <= 0) return 0;
    if (!taxRate || taxRate <= 0) return basePrice;
    
    return basePrice * (1 + taxRate);
};

// ============================================================================
// DELIVERY COST CALCULATIONS
// ============================================================================

/**
 * Calculate delivery cost based on subtotal
 * 
 * @param {number} subtotal - Order subtotal (tax-inclusive product prices)
 * @param {Object} deliverySettings - Delivery cost settings from backend
 * @returns {number} Delivery cost
 */
export const calculateDeliveryCost = (subtotal, deliverySettings = {}) => {
    const {
        freeDeliveryThreshold = 100,
        flatDeliveryCost = 10,
        deliveryEnabled = true
    } = deliverySettings;
    
    if (!deliveryEnabled) return 0;
    if (subtotal >= freeDeliveryThreshold) return 0;
    
    return flatDeliveryCost;
};

// ============================================================================
// ORDER SUMMARY CALCULATIONS
// ============================================================================

/**
 * Calculate complete order summary with tax breakdown
 * 
 * @param {Array} items - Cart items with price (tax-inclusive) and quantity
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.09 for 9%)
 * @param {Object} deliverySettings - Delivery cost settings
 * @returns {Object} Complete order breakdown
 * 
 * Returns:
 * {
 *   subtotal: 200.00,          // Sum of all products (tax-inclusive)
 *   taxAmount: 16.51,          // Tax extracted from subtotal
 *   baseAmount: 183.49,        // Subtotal without tax
 *   deliveryCost: 10.00,       // Delivery fee
 *   total: 210.00              // Subtotal + Delivery
 * }
 */
export const calculateOrderSummary = (items, taxRate, deliverySettings = {}) => {
    // Calculate subtotal (sum of all tax-inclusive prices)
    const subtotal = items.reduce((sum, item) => {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = parseInt(item.quantity) || 1;
        return sum + (itemPrice * itemQuantity);
    }, 0);
    
    // Extract tax from subtotal
    const taxAmount = extractTaxFromPrice(subtotal, taxRate);
    
    // Calculate base amount (subtotal without tax)
    const baseAmount = subtotal - taxAmount;
    
    // Calculate delivery cost
    const deliveryCost = calculateDeliveryCost(subtotal, deliverySettings);
    
    // Calculate final total (subtotal already includes tax, so just add delivery)
    const total = subtotal + deliveryCost;
    
    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        baseAmount: parseFloat(baseAmount.toFixed(2)),
        deliveryCost: parseFloat(deliveryCost.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        taxRate: taxRate
    };
};

/**
 * Calculate order summary for a single product (Buy Now flow)
 * 
 * @param {Object} product - Product with price (tax-inclusive)
 * @param {number} quantity - Quantity to purchase
 * @param {number} taxRate - Tax rate as decimal
 * @param {Object} deliverySettings - Delivery cost settings
 * @returns {Object} Order breakdown
 */
export const calculateSingleProductSummary = (product, quantity, taxRate, deliverySettings = {}) => {
    const items = [{
        price: product.price,
        quantity: quantity
    }];
    
    return calculateOrderSummary(items, taxRate, deliverySettings);
};

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * פונקציית עיצוב מחיר אוניברסלית
 * מטפלת בכל סוגי המטבעות ואובייקטי הגדרות
 * 
 * @param {number} amount - הסכום לעיצוב
 * @param {string|Object} currencyOrSettings - יכול להיות:
 *   - מחרוזת: סמל מטבע ('$', '€', וכו') - עיצוב פשוט
 *   - מחרוזת: קוד מטבע ('USD', 'EUR', וכו') - משתמש ב-Intl אם 3 אותיות
 *   - אובייקט: אובייקט הגדרות עם תכונה .currency
 * @returns {string} מחיר מעוצב
 * 
 * דוגמאות שימוש:
 *   formatPrice(29.99)                         // "$29.99" (ברירת מחדל)
 *   formatPrice(29.99, '$')                    // "$29.99" (פשוט)
 *   formatPrice(29.99, 'USD')                  // "$29.99" (Intl format)
 *   formatPrice(29.99, 'ILS')                  // "₪29.99" (Intl format)
 *   formatPrice(29.99, settings)               // משתמש ב-settings.currency
 *   formatPrice(29.99, settings.currency)      // מטבע ישיר מהגדרות
 */
export const formatPrice = (amount, currencyOrSettings = '$') => {
    const numericAmount = parseFloat(amount);
    
    // Determine currency
    let currency = 'ILS';
    let useCurrencyCode = false;
    
    if (typeof currencyOrSettings === 'string') {
        currency = currencyOrSettings;
        // If it's a 3-letter currency code (USD, EUR, GBP), use Intl
        useCurrencyCode = currency.length === 3;
    } else if (currencyOrSettings && typeof currencyOrSettings === 'object' && currencyOrSettings.currency) {
        currency = currencyOrSettings.currency;
        useCurrencyCode = currency.length === 3;
    }
    
    // Handle invalid amounts
    if (isNaN(numericAmount)) {
        if (useCurrencyCode) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(0);
        }
        return `${currency}0.00`;
    }
    
    // Format with Intl for currency codes (USD, EUR, etc.)
    if (useCurrencyCode) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(numericAmount);
    }
    
    // Simple formatting for currency symbols ($, €, etc.)
    return `${currency}${numericAmount.toFixed(2)}`;
};

/**
 * Format tax rate as percentage
 * 
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.09)
 * @returns {string} Formatted percentage (e.g., "9%")
 */
export const formatTaxRate = (taxRate) => {
    return `${(taxRate * 100).toFixed(0)}%`;
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate price input
 * 
 * @param {number} price - Price to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validatePrice = (price) => {
    if (price === null || price === undefined || price === '') {
        return { isValid: false, error: 'Price is required' };
    }
    
    const numericPrice = parseFloat(price);
    
    if (isNaN(numericPrice)) {
        return { isValid: false, error: 'Price must be a valid number' };
    }
    
    if (numericPrice < 0) {
        return { isValid: false, error: 'Price cannot be negative' };
    }
    
    if (numericPrice > 999999.99) {
        return { isValid: false, error: 'Price is too high' };
    }
    
    return { isValid: true, error: '' };
};

/**
 * Validate tax rate input
 * 
 * @param {number} taxRate - Tax rate to validate (decimal)
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateTaxRate = (taxRate) => {
    if (taxRate === null || taxRate === undefined) {
        return { isValid: false, error: 'Tax rate is required' };
    }
    
    const numericRate = parseFloat(taxRate);
    
    if (isNaN(numericRate)) {
        return { isValid: false, error: 'Tax rate must be a valid number' };
    }
    
    if (numericRate < 0) {
        return { isValid: false, error: 'Tax rate cannot be negative' };
    }
    
    if (numericRate > 1) {
        return { isValid: false, error: 'Tax rate cannot exceed 100%' };
    }
    
    return { isValid: true, error: '' };
};

// ============================================================================
// ADMIN PRICING HELPERS
// ============================================================================

/**
 * Calculate what price admin should enter based on desired base price
 * (Admin enters tax-inclusive prices, so this helps calculate the final price)
 * 
 * @param {number} desiredBasePrice - The price before tax that admin wants
 * @param {number} taxRate - Tax rate as decimal
 * @returns {number} The price admin should enter (includes tax)
 * 
 * Example: If admin wants base price of $100 with 9% tax:
 * calculateAdminPrice(100, 0.09) = 109 (what they should enter)
 */
export const calculateAdminPrice = (desiredBasePrice, taxRate) => {
    return addTaxToBasePrice(desiredBasePrice, taxRate);
};

/**
 * Show admin what the base price and tax breakdown will be for their entered price
 * 
 * @param {number} enteredPrice - The price admin entered (tax-inclusive)
 * @param {number} taxRate - Tax rate as decimal
 * @returns {Object} Breakdown of the price
 */
export const getAdminPriceBreakdown = (enteredPrice, taxRate) => {
    const basePrice = getBasePriceFromInclusive(enteredPrice, taxRate);
    const taxAmount = extractTaxFromPrice(enteredPrice, taxRate);
    
    return {
        enteredPrice: parseFloat(enteredPrice.toFixed(2)),
        basePrice: parseFloat(basePrice.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        taxRate: taxRate,
        taxRateFormatted: formatTaxRate(taxRate)
    };
};

export default {
    extractTaxFromPrice,
    getBasePriceFromInclusive,
    calculateTaxFromBasePrice,
    addTaxToBasePrice,
    calculateDeliveryCost,
    calculateOrderSummary,
    calculateSingleProductSummary,
    formatPrice,
    formatTaxRate,
    validatePrice,
    validateTaxRate,
    calculateAdminPrice,
    getAdminPriceBreakdown
};

