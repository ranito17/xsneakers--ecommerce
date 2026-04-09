const { normalizeString, toPositiveInt, toOptionalBool01 } = require('./commonValidator');

const MAX_PRICE = 999999.99;

const parseImageUrls = (image_urls) => {
    if (image_urls == null || image_urls === '') return undefined;

    if (Array.isArray(image_urls)) {
        return image_urls
            .map(v => (typeof v === 'string' ? v.trim() : ''))
            .filter(Boolean);
    }

    if (typeof image_urls === 'string') {
        const s = image_urls.trim();
        if (!s) return undefined;
        try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) {
                return parsed
                    .map(v => (typeof v === 'string' ? v.trim() : ''))
                    .filter(Boolean);
            }
        } catch {
            // treat as comma-separated
        }
        return s
            .split(',')
            .map(v => v.trim())
            .filter(Boolean);
    }

    return null;
};

const validateSizesArray = (sizes) => {
    const errors = {};

    if (sizes === undefined) {
        return { isValid: true, errors: {}, sanitized: undefined };
    }

    if (!Array.isArray(sizes)) {
        return { isValid: false, errors: { sizes: 'Sizes must be an array' }, sanitized: undefined };
    }

    const seen = new Set();
    const sanitized = [];

    sizes.forEach((item, idx) => {
        if (!item || typeof item !== 'object') {
            errors[`sizes[${idx}]`] = 'Each size must be an object';
            return;
        }

        const rawSize = item.size;
        const rawQty = item.quantity;

        const sizeStr = typeof rawSize === 'string' ? rawSize.trim() : String(rawSize ?? '').trim();
        const sizeNum = Number(sizeStr);

        if (!sizeStr || Number.isNaN(sizeNum) || sizeNum <= 0) {
            errors[`sizes[${idx}].size`] = 'Size must be a valid number greater than 0';
            return;
        }

        const key = String(sizeNum);
        if (seen.has(key)) {
            errors.sizes = 'Duplicate sizes are not allowed';
            return;
        }
        seen.add(key);

        const qtyNum = Number(rawQty);
        if (!Number.isInteger(qtyNum) || qtyNum < 0) {
            errors[`sizes[${idx}].quantity`] = 'Quantity must be an integer >= 0';
            return;
        }

        sanitized.push({ size: sizeStr, quantity: qtyNum });
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitized
    };
};

function validateProductIdParam(id) {
    const errors = {};
    const productId = toPositiveInt(id);
    if (!productId) errors.id = 'Product ID must be a positive integer';
    return { isValid: Object.keys(errors).length === 0, errors, sanitized: productId };
}

function validateCreateProductPayload(body) {
    const errors = {};

    const name = normalizeString(body?.name);
    if (!name) errors.name = 'Name is required';
    else if (name.length < 2) errors.name = 'Name must be at least 2 characters';
    else if (name.length > 100) errors.name = 'Name must be less than 100 characters';

    const priceRaw = body?.price;
    const price = Number(priceRaw);
    if (priceRaw === undefined || priceRaw === null || priceRaw === '') errors.price = 'Price is required';
    else if (Number.isNaN(price)) errors.price = 'Price must be a valid number';
    else if (price <= 0) errors.price = 'Price must be greater than 0';
    else if (price > MAX_PRICE) errors.price = 'Price is too high';

    const categoryId = toPositiveInt(body?.category_id);
    if (!categoryId) errors.category_id = 'Category ID is required';

    const description = body?.description === undefined ? undefined : String(body.description);
    if (description !== undefined && description.length > 500) {
        errors.description = 'Description must be less than 500 characters';
    }

    const sizesValidation = validateSizesArray(body?.sizes);
    if (!sizesValidation.isValid) Object.assign(errors, sizesValidation.errors);

    const image_urls = parseImageUrls(body?.image_urls);
    if (image_urls === null) errors.image_urls = 'Invalid image_urls format';

    const is_active = toOptionalBool01(body?.is_active);
    if (is_active === null) errors.is_active = 'is_active must be boolean/0/1';

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: {
            name,
            price,
            category_id: categoryId,
            description: description === undefined ? undefined : description,
            sizes: sizesValidation.sanitized,
            image_urls,
            is_active
        }
    };
}

function validateUpdateProductPayload(body) {
    const errors = {};

    const sanitizedData = {};

    if (body?.name !== undefined) {
        const name = normalizeString(body.name);
        if (!name) errors.name = 'Name is required';
        else if (name.length < 2) errors.name = 'Name must be at least 2 characters';
        else if (name.length > 100) errors.name = 'Name must be less than 100 characters';
        sanitizedData.name = name;
    }

    if (body?.price !== undefined) {
        const price = Number(body.price);
        if (body.price === null || body.price === '') errors.price = 'Price is required';
        else if (Number.isNaN(price)) errors.price = 'Price must be a valid number';
        else if (price <= 0) errors.price = 'Price must be greater than 0';
        else if (price > MAX_PRICE) errors.price = 'Price is too high';
        sanitizedData.price = price;
    }

    if (body?.category_id !== undefined) {
        const categoryId = toPositiveInt(body.category_id);
        if (!categoryId) errors.category_id = 'Category ID must be a positive integer';
        sanitizedData.category_id = categoryId;
    }

    if (body?.description !== undefined) {
        const description = String(body.description ?? '');
        if (description.length > 500) errors.description = 'Description must be less than 500 characters';
        sanitizedData.description = description;
    }

    if (body?.sizes !== undefined) {
        const sizesValidation = validateSizesArray(body.sizes);
        if (!sizesValidation.isValid) Object.assign(errors, sizesValidation.errors);
        sanitizedData.sizes = sizesValidation.sanitized;
    }

    if (body?.image_urls !== undefined) {
        const image_urls = parseImageUrls(body.image_urls);
        if (image_urls === null) errors.image_urls = 'Invalid image_urls format';
        sanitizedData.image_urls = image_urls;
    }

    if (body?.is_active !== undefined) {
        const is_active = toOptionalBool01(body.is_active);
        if (is_active === null) errors.is_active = 'is_active must be boolean/0/1';
        sanitizedData.is_active = is_active;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData
    };
}

function validateUpdateProductSizesPayload(body) {
    const sizesValidation = validateSizesArray(body?.sizes);
    return {
        isValid: sizesValidation.isValid,
        errors: sizesValidation.errors,
        sanitizedData: { sizes: sizesValidation.sanitized }
    };
}

module.exports = {
    validateProductIdParam,
    validateCreateProductPayload,
    validateUpdateProductPayload,
    validateUpdateProductSizesPayload
};

