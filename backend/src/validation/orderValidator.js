const { normalizeString, toPositiveInt } = require('./commonValidator');

const ALLOWED_ORDER_STATUSES = new Set([
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
]);

const validateOrderAddress = (address) => {
    const errors = {};

    if (!address || typeof address !== 'object') {
        return {
            isValid: false,
            errors: { address: 'Address is required' }
        };
    }

    if (!address.house_number || String(address.house_number).trim() === '') {
        errors.house_number = 'House number is required';
    }

    if (!address.street || String(address.street).trim() === '') {
        errors.street = 'Street is required';
    }

    if (!address.city || String(address.city).trim() === '') {
        errors.city = 'City is required';
    }

    if (!address.zipcode || String(address.zipcode).trim() === '') {
        errors.zipcode = 'Zipcode is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

const validateOrderItems = (items) => {
    const errors = {};

    if (!Array.isArray(items) || items.length === 0) {
        return {
            isValid: false,
            errors: { items: 'At least one order item is required' }
        };
    }

    items.forEach((item, index) => {
        if (!toPositiveInt(item.product_id)) {
            errors[`items[${index}].product_id`] = 'Valid product_id is required';
        }

        if (!toPositiveInt(item.quantity)) {
            errors[`items[${index}].quantity`] = 'Quantity must be a positive integer';
        }

        if (!item.selected_size || String(item.selected_size).trim() === '') {
            errors[`items[${index}].selected_size`] = 'Selected size is required';
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

const validatePlaceOrderPayload = (payload) => {
    const addressValidation = validateOrderAddress(payload.address);
    const itemsValidation = validateOrderItems(payload.items);

    const errors = {
        ...addressValidation.errors,
        ...itemsValidation.errors
    };

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

const validateOrderIdParam = (orderId) => {
    const errors = {};
    const id = toPositiveInt(orderId);
    if (!id) errors.orderId = 'Order ID must be a positive integer';
    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitized: id
    };
};

const validateUpdateOrderStatusPayload = (body) => {
    const errors = {};
    const status = normalizeString(body?.status).toLowerCase();

    if (!status) errors.status = 'Status is required';
    else if (!ALLOWED_ORDER_STATUSES.has(status)) errors.status = 'Invalid status';

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: { status }
    };
};

module.exports = {
    validateOrderAddress,
    validateOrderItems,
    validatePlaceOrderPayload,
    validateOrderIdParam,
    validateUpdateOrderStatusPayload
};