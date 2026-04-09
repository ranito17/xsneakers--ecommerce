/**
 * Order Utilities
 * 
 * All order-related formatting, validation, and data transformation functions.
 * Handles order numbers, status, totals, and data transformations.
 */

import { formatDate } from './date.utils';
import { formatPrice } from './price.utils';
import { formatAddress as formatUserAddress } from './user.utils';
import { parseImageUrls, getAbsoluteImageUrl } from './image.utils';

// Re-export formatAddress for convenience in order contexts
export const formatAddress = formatUserAddress;

// ============================================================================
// ORDER NUMBER FORMATTING
// ============================================================================

/**
 * Format order number with fallback to order ID
 * @param {Object} order - Order object
 * @returns {string} Formatted order number
 */
export const formatOrderNumber = (order) => {
    if (!order) return 'N/A';
    
    // Prefer order_number field
    if (order.order_number) {
        return order.order_number;
    }
    
    // Fallback to order_id with prefix
    if (order.order_id) {
        return `#${order.order_id}`;
    }
    
    // Last resort: use id
    if (order.id) {
        return `#${order.id}`;
    }
    
    return 'N/A';
};

// ============================================================================
// ORDER STATUS FORMATTING
// ============================================================================

/**
 * Get CSS class name for order status
 * @param {string} status - Order status
 * @returns {string} CSS class name
 */
export const getOrderStatusClass = (status) => {
    if (!status) return 'pending';
    
    const statusLower = status.toLowerCase();
    
    const statusMap = {
        'pending': 'pending',
        'processing': 'processing',
        'shipped': 'shipped',
        'delivered': 'delivered',
        'cancelled': 'cancelled',
        'refunded': 'refunded'
    };
    
    return statusMap[statusLower] || 'pending';
};

/**
 * Get CSS class name for payment status
 * @param {string} status - Payment status
 * @returns {string} CSS class name
 */
export const getPaymentStatusClass = (status) => {
    if (!status) return 'pending';
    
    const statusLower = status.toLowerCase();
    
    const statusMap = {
        'paid': 'paid',
        'pending': 'pending',
        'failed': 'failed',
        'refunded': 'refunded'
    };
    
    return statusMap[statusLower] || 'pending';
};

/**
 * Get human-readable order status label
 * @param {string} status - Order status
 * @returns {string} Human-readable status
 */
export const getOrderStatusLabel = (status) => {
    if (!status) return 'Pending';
    
    const statusLower = status.toLowerCase();
    
    const labelMap = {
        'pending': 'Pending',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        'refunded': 'Refunded'
    };
    
    return labelMap[statusLower] || status;
};

/**
 * Get human-readable payment status label
 * @param {string} status - Payment status
 * @returns {string} Human-readable status
 */
export const getPaymentStatusLabel = (status) => {
    if (!status) return 'Pending';
    
    const statusLower = status.toLowerCase();
    
    const labelMap = {
        'paid': 'Paid',
        'pending': 'Pending',
        'failed': 'Failed',
        'refunded': 'Refunded'
    };
    
    return labelMap[statusLower] || status;
};

// ============================================================================
// ORDER TOTALS FORMATTING
// ============================================================================

/**
 * Format order total amount
 * @param {number} amount - Total amount
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted total
 */
export const formatOrderTotal = (amount, currency = 'ILS') => {
    return formatPrice(amount, currency);
};

/**
 * Calculate order totals from items
 * @param {Array} items - Order items
 * @param {Object} settings - Settings object with tax rate, delivery cost, etc.
 * @returns {Object} { subtotal, tax, delivery, total }
 */
export const calculateOrderTotals = (items, settings = {}) => {
    if (!Array.isArray(items) || items.length === 0) {
        return {
            subtotal: 0,
            tax: 0,
            delivery: 0,
            total: 0
        };
    }
    
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
        const price = parseFloat(item.price || item.product_price || 0);
        const quantity = parseInt(item.quantity || 0);
        return sum + (price * quantity);
    }, 0);
    
    // Calculate tax
    const taxRate = settings.taxRate || settings.tax_rate || 0;
    const tax = subtotal * taxRate;
    
    // Calculate delivery cost
    const delivery = parseFloat(settings.delivery_cost || settings.deliveryCost || 0);
    
    // Calculate total
    const total = subtotal + tax + delivery;
    
    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        delivery: parseFloat(delivery.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
};

// ============================================================================
// ORDER VALIDATION
// ============================================================================

/**
 * Validate order items array
 * @param {Array} items - Order items to validate
 * @returns {Object} { isValid: boolean, errors: array }
 */
export const validateOrderItems = (items) => {
    const errors = [];
    
    if (!Array.isArray(items)) {
        return {
            isValid: false,
            errors: ['Order items must be an array']
        };
    }
    
    if (items.length === 0) {
        return {
            isValid: false,
            errors: ['Order must contain at least one item']
        };
    }
    
    items.forEach((item, index) => {
        // Validate product_id
        if (!item.product_id) {
            errors.push(`Item ${index + 1}: Product ID is required`);
        }
        
        // Validate quantity
        if (!item.quantity || item.quantity <= 0) {
            errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
        
        // Validate selected_size (if applicable)
        // This is optional, some products may not have sizes
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate order data before submission
 * @param {Object} orderData - Order data to validate
 * @returns {Object} { isValid: boolean, errors: object }
 */
export const validateOrderData = (orderData) => {
    const errors = {};
    
    // Validate user_id
    if (!orderData.user_id) {
        errors.user_id = 'User ID is required';
    }
    
    // Validate total_amount
    if (!orderData.total_amount || orderData.total_amount <= 0) {
        errors.total_amount = 'Total amount must be greater than 0';
    }
    
    // Validate items
    const itemsValidation = validateOrderItems(orderData.items);
    if (!itemsValidation.isValid) {
        errors.items = itemsValidation.errors.join('; ');
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ============================================================================
// DATA TRANSFORMATION (Frontend ↔ Backend)
// ============================================================================

/**
 * Prepare order data for backend submission
 * Ensures data integrity and correct types
 * @param {Object} orderData - Raw order form data
 * @returns {Object} Sanitized order data ready for API
 */
export const prepareOrderForBackend = (orderData) => {
    return {
        user_id: parseInt(orderData.user_id),
        total_amount: parseFloat(orderData.total_amount),
        subtotal: orderData.subtotal ? parseFloat(orderData.subtotal) : undefined,
        delivery_cost: orderData.delivery_cost ? parseFloat(orderData.delivery_cost) : undefined,
        payment_status: orderData.payment_status || 'pending',
        status: orderData.status || 'pending',
        items: orderData.items.map(item => ({
            product_id: parseInt(item.product_id || item.id),
            quantity: parseInt(item.quantity),
            selected_size: item.selected_size || null
        }))
    };
};

/**
 * Parse order data received from backend
 * Ensures consistent format for frontend consumption
 * @param {Object} backendOrder - Order data from API
 * @returns {Object} Parsed order ready for display
 */
export const parseOrderFromBackend = (backendOrder) => {
    return {
        ...backendOrder,
        order_number: formatOrderNumber(backendOrder),
        formatted_date: formatDate(backendOrder.created_at, 'short'),
        formatted_total: formatOrderTotal(backendOrder.total_amount),
        status_label: getOrderStatusLabel(backendOrder.status),
        payment_status_label: getPaymentStatusLabel(backendOrder.payment_status),
        status_class: getOrderStatusClass(backendOrder.status),
        payment_status_class: getPaymentStatusClass(backendOrder.payment_status)
    };
};

/**
 * Transform API order data to match component expectations
 * Used in admin order management
 * @param {Object} apiOrder - Raw order from API
 * @returns {Object} Transformed order for display
 */
export const transformOrderForDisplay = (apiOrder) => {
    return {
        id: apiOrder.order_id,
        orderNumber: apiOrder.order_number || `#${apiOrder.order_id}`,
        customerName: apiOrder.customer_name || 'N/A',
        customerEmail: apiOrder.customer_email || 'N/A',
        totalAmount: parseFloat(apiOrder.total_amount),
        status: apiOrder.status || 'pending',
        paymentStatus: apiOrder.payment_status || 'pending',
        createdAt: apiOrder.created_at,
        formattedDate: formatDate(apiOrder.created_at, 'short'),
        formattedTotal: formatOrderTotal(apiOrder.total_amount),
        statusLabel: getOrderStatusLabel(apiOrder.status),
        paymentStatusLabel: getPaymentStatusLabel(apiOrder.payment_status)
    };
};

// ============================================================================
// ORDER ITEM HELPERS
// ============================================================================

/**
 * Format order item for display
 * @param {Object} item - Order item
 * @returns {Object} Formatted item
 */
export const formatOrderItem = (item) => {
    return {
        ...item,
        formatted_price: formatPrice(item.product_price || item.price),
        total_price: formatPrice((item.product_price || item.price) * item.quantity)
    };
};

/**
 * Calculate total for a single order item
 * @param {Object} item - Order item
 * @returns {number} Item total (price * quantity)
 */
export const calculateItemTotal = (item) => {
    const price = parseFloat(item.product_price || item.price || 0);
    const quantity = parseInt(item.quantity || 0);
    return price * quantity;
};

/**
 * Get order items count (total number of items considering quantities)
 * @param {Array} items - Order items
 * @returns {number} Total item count
 */
export const getOrderItemsCount = (items) => {
    if (!Array.isArray(items)) return 0;
    
    return items.reduce((total, item) => {
        return total + parseInt(item.quantity || 0);
    }, 0);
};

/**
 * Get unique product count in order (ignoring quantities)
 * @param {Array} items - Order items
 * @returns {number} Number of unique products
 */
export const getUniqueProductsCount = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.length;
};

// ============================================================================
// ORDER DISPLAY HELPERS
// ============================================================================

/**
 * Format customer name with truncation
 * @param {string} name - Customer name
 * @param {number} maxLength - Maximum length (default: 20)
 * @returns {string} Formatted name
 */
export const formatCustomerName = (name, maxLength = 20) => {
    if (!name) return 'N/A';
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
};

/**
 * Format customer email with truncation
 * @param {string} email - Customer email
 * @param {number} maxLength - Maximum length (default: 25)
 * @returns {string} Formatted email
 */
export const formatCustomerEmail = (email, maxLength = 25) => {
    if (!email) return 'N/A';
    return email.length > maxLength ? email.substring(0, maxLength) + '...' : email;
};

/**
 * Get unique sizes from order items
 * @param {Array} orderItems - Order items
 * @returns {Array} Sorted array of unique sizes
 */
export const getOrderSizes = (orderItems) => {
    if (!Array.isArray(orderItems)) return [];
    
    const sizes = new Set();
    orderItems.forEach(item => {
        if (item.selected_size) {
            sizes.add(item.selected_size);
        }
    });
    
    return Array.from(sizes).sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return String(a).localeCompare(String(b));
    });
};

/**
 * Get primary images from order items (max 2)
 * @param {Array} orderItems - Order items
 * @param {number} maxImages - Maximum number of images (default: 2)
 * @returns {Array} Array of image objects with url, allImages, and productName
 */
export const getOrderImages = (orderItems, maxImages = 2) => {
    if (!Array.isArray(orderItems)) return [];
    
    const images = [];
    for (const item of orderItems) {
        const imageField = item.product_images || item.image_urls || item.images || item.img_url;
        const imageUrls = parseImageUrls(imageField);
        if (imageUrls.length > 0) {
            const absoluteImages = imageUrls.map((img) => getAbsoluteImageUrl(img));
            images.push({
                url: absoluteImages[0],
                allImages: absoluteImages,
                productName: item.product_name || item.name || 'Product'
            });
        }
        if (images.length === maxImages) break;
    }
    return images;
};

/**
 * Get product image URL from image string or product image object
 * @param {string|Array|Object} imageData - Image field or image object
 * @param {number} index - Image index (default: 0 for primary)
 * @returns {string} Image URL or placeholder
 */
export const getProductImage = (imageData, index = 0) => {
    const imageUrls = parseImageUrls(imageData);
    if (imageUrls.length === 0) {
        return '/placeholder-image.jpg';
    }
    return getAbsoluteImageUrl(imageUrls[index] || imageUrls[0]);
};

/**
 * Format size for display
 * @param {string|number} selectedSize - Selected size
 * @returns {string} Formatted size
 */
export const formatSizeDisplay = (selectedSize) => {
    if (!selectedSize) return '';
    return selectedSize.toString();
};

// ============================================================================
// ORDER FILTERING & SORTING
// ============================================================================

/**
 * Filter orders by criteria
 * @param {Array} orders - Orders to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered orders
 */
export const filterOrders = (orders, filters) => {
    if (!Array.isArray(orders)) return [];
    
    return orders.filter(order => {
        // Status filter
        if (filters.status && filters.status !== 'all' && order.status !== filters.status) {
            return false;
        }
        
        // Size filter
        if (filters.sizes && filters.sizes.length > 0) {
            const orderSizes = getOrderSizes(filters.orderItems?.[order.order_id] || []);
            const hasSizeMatch = filters.sizes.some(size => orderSizes.includes(size));
            if (!hasSizeMatch) return false;
        }
        
        // Total amount range
        if (filters.minTotal && parseFloat(order.total_amount) < parseFloat(filters.minTotal)) {
            return false;
        }
        if (filters.maxTotal && parseFloat(order.total_amount) > parseFloat(filters.maxTotal)) {
            return false;
        }
        
        // Product search (requires orderItems)
        if (filters.productSearch && filters.productSearch.trim()) {
            const items = filters.orderItems?.[order.order_id] || [];
            const hasProductMatch = items.some(item => 
                item.product_name?.toLowerCase().includes(filters.productSearch.toLowerCase())
            );
            if (!hasProductMatch) return false;
        }
        
        // Date range
        if (filters.startDate) {
            const orderDate = new Date(order.created_at);
            const startDate = new Date(filters.startDate);
            if (orderDate < startDate) return false;
        }
        if (filters.endDate) {
            const orderDate = new Date(order.created_at);
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999); // End of day
            if (orderDate > endDate) return false;
        }
        
        // Quantity range
        if (filters.minQuantity || filters.maxQuantity) {
            const items = filters.orderItems?.[order.order_id] || [];
            const totalQuantity = items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
            
            if (filters.minQuantity && totalQuantity < parseInt(filters.minQuantity)) {
                return false;
            }
            if (filters.maxQuantity && totalQuantity > parseInt(filters.maxQuantity)) {
                return false;
            }
        }
        
        return true;
    });
};

/**
 * Sort orders by criteria
 * @param {Array} orders - Orders to sort
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {Array} Sorted orders
 */
export const sortOrders = (orders, sortBy = 'created_at', sortOrder = 'desc') => {
    if (!Array.isArray(orders)) return [];
    
    return [...orders].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        // Handle date sorting
        if (sortBy === 'created_at' || sortBy === 'orderDate') {
            aValue = new Date(a.created_at || a.orderDate);
            bValue = new Date(b.created_at || b.orderDate);
        }
        
        // Handle total amount sorting
        if (sortBy === 'totalAmount' || sortBy === 'total_amount') {
            aValue = parseFloat(a.total_amount || a.totalAmount || 0);
            bValue = parseFloat(b.total_amount || b.totalAmount || 0);
        }
        
        // Handle customer name sorting
        if (sortBy === 'customerName' || sortBy === 'customer_name') {
            aValue = (a.customer_name || a.customerName || '').toLowerCase();
            bValue = (b.customer_name || b.customerName || '').toLowerCase();
        }
        
        // Handle status sorting
        if (sortBy === 'status') {
            aValue = (a.status || '').toLowerCase();
            bValue = (b.status || '').toLowerCase();
        }
        
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
};

/**
 * Get all unique sizes from all order items
 * @param {Object} orderItems - Object mapping order IDs to their items
 * @returns {Array} Sorted array of all unique sizes
 */
export const getAllAvailableSizes = (orderItems) => {
    if (!orderItems || typeof orderItems !== 'object') return [];
    
    const sizes = new Set();
    Object.values(orderItems).forEach(items => {
        if (Array.isArray(items)) {
            items.forEach(item => {
                if (item.selected_size) {
                    sizes.add(item.selected_size);
                }
            });
        }
    });
    
    return Array.from(sizes).sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numB - numA; // Sort from biggest to smallest
        }
        return String(b).localeCompare(String(a));
    });
};

/**
 * Get min and max order price from orders array
 * @param {Array} orders - Array of orders
 * @returns {Object} { min: number, max: number }
 */
export const getOrderPriceRange = (orders) => {
    if (!Array.isArray(orders) || orders.length === 0) {
        return { min: 0, max: 1000 };
    }
    
    const prices = orders.map(order => parseFloat(order.total_amount || 0)).filter(p => !isNaN(p) && p > 0);
    
    if (prices.length === 0) {
        return { min: 0, max: 1000 };
    }
    
    return {
        min: Math.floor(Math.min(...prices)),
        max: Math.ceil(Math.max(...prices))
    };
};

/**
 * Get min and max quantity from order items
 * @param {Object} orderItems - Object mapping order IDs to their items
 * @returns {Object} { min: number, max: number }
 */
export const getOrderQuantityRange = (orderItems) => {
    if (!orderItems || typeof orderItems !== 'object') {
        return { min: 1, max: 10 };
    }
    
    const quantities = [];
    Object.values(orderItems).forEach(items => {
        if (Array.isArray(items)) {
            items.forEach(item => {
                const quantity = parseInt(item.quantity || 0);
                if (!isNaN(quantity) && quantity > 0) {
                    quantities.push(quantity);
                }
            });
        }
    });
    
    if (quantities.length === 0) {
        return { min: 1, max: 10 };
    }
    
    return {
        min: Math.floor(Math.min(...quantities)),
        max: Math.ceil(Math.max(...quantities))
    };
};

