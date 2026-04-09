const { normalizeString, toNumber, toNonNegativeInt } = require('./commonValidator');
const { isValidEmail } = require('./formValidation');

const ALLOWED_KEYS = new Set([
    'store_name',
    'supplier_name',
    'supplier_email',
    'tax_rate',
    'currency',
    'default_delivery_cost',
    'free_delivery_threshold',
    'email_notification',
    'store_instagram',
    'low_stock_threshold',
    'low_stock_threshold_per_size',
    'best_sellers_limit',
    'homepage_display_limit'
]);

function validateUpdateSettingsPayload(body) {
    const errors = {};
    const sanitizedData = {};

    if (!body || typeof body !== 'object') {
        return {
            isValid: false,
            errors: { body: 'Settings payload must be an object' },
            sanitizedData: {}
        };
    }

    const unknownKeys = Object.keys(body).filter((k) => !ALLOWED_KEYS.has(k));
    if (unknownKeys.length > 0) {
        errors.unknownKeys = `Unknown settings keys: ${unknownKeys.join(', ')}`;
    }

    // Copy only allowed keys
    for (const key of Object.keys(body)) {
        if (ALLOWED_KEYS.has(key)) sanitizedData[key] = body[key];
    }

    // store_name required
    const store_name = normalizeString(sanitizedData.store_name);
    if (!store_name) errors.store_name = 'store_name is required';
    else if (store_name.length < 2) errors.store_name = 'store_name must be at least 2 characters';
    sanitizedData.store_name = store_name;

    // supplier_name optional
    if (sanitizedData.supplier_name !== undefined) {
        const supplier_name = normalizeString(sanitizedData.supplier_name);
        if (supplier_name && supplier_name.length < 2) errors.supplier_name = 'supplier_name must be at least 2 characters';
        sanitizedData.supplier_name = supplier_name;
    }

    // supplier_email optional
    if (sanitizedData.supplier_email !== undefined) {
        const supplier_email = normalizeString(sanitizedData.supplier_email);
        if (supplier_email && !isValidEmail(supplier_email)) errors.supplier_email = 'Valid supplier_email is required';
        sanitizedData.supplier_email = supplier_email;
    }

    // tax_rate optional 0..1
    if (sanitizedData.tax_rate !== undefined) {
        const tax_rate = toNumber(sanitizedData.tax_rate);
        if (tax_rate === null) errors.tax_rate = 'tax_rate must be a valid number';
        else if (tax_rate < 0 || tax_rate > 1) errors.tax_rate = 'tax_rate must be between 0 and 1';
        sanitizedData.tax_rate = tax_rate;
    }

    // currency optional
    if (sanitizedData.currency !== undefined) {
        sanitizedData.currency = normalizeString(sanitizedData.currency);
    }

    // delivery / thresholds >= 0
    if (sanitizedData.default_delivery_cost !== undefined) {
        const v = toNumber(sanitizedData.default_delivery_cost);
        if (v === null || v < 0) errors.default_delivery_cost = 'default_delivery_cost must be >= 0';
        sanitizedData.default_delivery_cost = v;
    }

    if (sanitizedData.free_delivery_threshold !== undefined) {
        const v = toNumber(sanitizedData.free_delivery_threshold);
        if (v === null || v < 0) errors.free_delivery_threshold = 'free_delivery_threshold must be >= 0';
        sanitizedData.free_delivery_threshold = v;
    }

    if (sanitizedData.low_stock_threshold !== undefined) {
        const v = toNonNegativeInt(sanitizedData.low_stock_threshold);
        if (v === null) errors.low_stock_threshold = 'low_stock_threshold must be >= 0';
        sanitizedData.low_stock_threshold = v;
    }

    if (sanitizedData.low_stock_threshold_per_size !== undefined) {
        const v = toNonNegativeInt(sanitizedData.low_stock_threshold_per_size);
        if (v === null) errors.low_stock_threshold_per_size = 'low_stock_threshold_per_size must be >= 0';
        sanitizedData.low_stock_threshold_per_size = v;
    }

    if (sanitizedData.best_sellers_limit !== undefined) {
        const v = toNonNegativeInt(sanitizedData.best_sellers_limit);
        if (v === null) errors.best_sellers_limit = 'best_sellers_limit must be >= 0';
        sanitizedData.best_sellers_limit = v;
    }

    if (sanitizedData.homepage_display_limit !== undefined) {
        const v = toNonNegativeInt(sanitizedData.homepage_display_limit);
        if (v === null) errors.homepage_display_limit = 'homepage_display_limit must be >= 0';
        sanitizedData.homepage_display_limit = v;
    }

    // strings we allow but don't deeply validate
    if (sanitizedData.store_instagram !== undefined) {
        sanitizedData.store_instagram = normalizeString(sanitizedData.store_instagram);
    }

    if (sanitizedData.email_notification !== undefined) {
        sanitizedData.email_notification = normalizeString(sanitizedData.email_notification);
        if (sanitizedData.email_notification && !isValidEmail(sanitizedData.email_notification)) {
            errors.email_notification = 'Valid email_notification is required';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData
    };
}

module.exports = {
    validateUpdateSettingsPayload
};

