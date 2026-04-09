const { normalizeString, toPositiveInt, toOptionalBool01 } = require('./commonValidator');

function validateCategoryIdParam(id) {
    const errors = {};
    const categoryId = toPositiveInt(id);
    if (!categoryId) errors.id = 'Category ID must be a positive integer';
    return { isValid: Object.keys(errors).length === 0, errors, sanitized: categoryId };
}

function validateCreateCategoryPayload(body) {
    const errors = {};

    const category_name = normalizeString(body?.category_name);
    if (!category_name) errors.category_name = 'Category name is required';
    else if (category_name.length <= 3) errors.category_name = 'Category name must be longer than 3 characters';
    else if (category_name.length > 50) errors.category_name = 'Category name must be less than 50 characters';

    const description = normalizeString(body?.description);
    if (!description) errors.description = 'Description is required';
    else if (description.length < 10) errors.description = 'Description must be at least 10 characters long';
    else if (description.length > 250) errors.description = 'Description must be less than 250 characters';

    const image_url = body?.image_url === undefined || body?.image_url === null
        ? undefined
        : String(body.image_url).trim();

    const is_active = toOptionalBool01(body?.is_active);
    if (is_active === null) errors.is_active = 'is_active must be boolean/0/1';

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: {
            category_name,
            description,
            image_url: image_url === '' ? null : (image_url === undefined ? undefined : image_url),
            is_active
        }
    };
}

function validateUpdateCategoryPayload(body) {
    const errors = {};
    const sanitizedData = {};

    if (body?.category_name !== undefined) {
        const category_name = normalizeString(body.category_name);
        if (!category_name) errors.category_name = 'Category name is required';
        else if (category_name.length <= 3) errors.category_name = 'Category name must be longer than 3 characters';
        else if (category_name.length > 50) errors.category_name = 'Category name must be less than 50 characters';
        sanitizedData.category_name = category_name;
    }

    if (body?.description !== undefined) {
        const description = normalizeString(body.description);
        if (!description) errors.description = 'Description is required';
        else if (description.length < 10) errors.description = 'Description must be at least 10 characters long';
        else if (description.length > 250) errors.description = 'Description must be less than 250 characters';
        sanitizedData.description = description;
    }

    if (body?.image_url !== undefined) {
        const image_url = body.image_url === null ? null : String(body.image_url).trim();
        sanitizedData.image_url = image_url === '' ? null : image_url;
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

module.exports = {
    validateCategoryIdParam,
    validateCreateCategoryPayload,
    validateUpdateCategoryPayload
};

