const { normalizeString, toPositiveInt } = require('./commonValidator');
const { isValidEmail } = require('./formValidation');

const ALLOWED_MESSAGE_STATUSES = new Set(['new', 'read', 'resolved', 'archived']);
const ALLOWED_MESSAGE_TYPES = new Set([
    'guest_to_admin',
    'customer_to_admin',
    'customer_to_admin_urgent',
    'admin_to_supplier',
    'low_stock_alert',
    'reply'
]);

const toPositiveIntOrNull = (value) => {
    if (value === undefined || value === null || value === '') return null;
    return toPositiveInt(value);
};

function validateMessageIdParam(id) {
    const errors = {};
    const messageId = toPositiveInt(id);
    if (!messageId) {
        errors.messageId = 'Message ID must be a positive integer';
    }
    return { isValid: Object.keys(errors).length === 0, errors, sanitized: messageId };
}

function validateCreateMessagePayload(body) {
    const errors = {};

    const messageType = normalizeString(body?.messageType).toLowerCase();
    if (!messageType) errors.messageType = 'messageType is required';
    else if (!ALLOWED_MESSAGE_TYPES.has(messageType)) errors.messageType = 'Invalid messageType';

    const subject = normalizeString(body?.subject);
    if (!subject) errors.subject = 'Subject is required';
    else if (subject.length < 6) errors.subject = 'Subject must be at least 6 characters long';
    else if (subject.length > 200) errors.subject = 'Subject must be less than 200 characters';

    const message = normalizeString(body?.message);
    if (!message) errors.message = 'Message is required';
    else if (message.length < 10) errors.message = 'Message must be at least 10 characters long';
    else if (message.length > 150) errors.message = 'Message must be less than 150 characters';

    // Sender info is required for guest/customer messages
    const isCustomerOrGuest =
        messageType === 'guest_to_admin' ||
        messageType === 'customer_to_admin' ||
        messageType === 'customer_to_admin_urgent';

    const name = normalizeString(body?.name);
    const email = normalizeString(body?.email);
    const phone = body?.phone === undefined ? undefined : String(body.phone).trim();

    if (isCustomerOrGuest) {
        if (!name) errors.name = 'Name is required';
        if (!email) errors.email = 'Email is required';
        else if (!isValidEmail(email)) errors.email = 'Valid email is required';
    } else {
        // For other message types, keep optional but validate if provided
        if (email && !isValidEmail(email)) errors.email = 'Valid email is required';
    }

    const recipientEmail = normalizeString(body?.recipientEmail);
    if (messageType === 'reply') {
        if (!recipientEmail) errors.recipientEmail = 'recipientEmail is required for reply';
        else if (!isValidEmail(recipientEmail)) errors.recipientEmail = 'Valid recipientEmail is required';
    } else if (recipientEmail) {
        if (!isValidEmail(recipientEmail)) errors.recipientEmail = 'Valid recipientEmail is required';
    }

    const orderId = toPositiveIntOrNull(body?.orderId);
    if (body?.orderId !== undefined && body?.orderId !== null && body?.orderId !== '' && !orderId) {
        errors.orderId = 'orderId must be a positive integer';
    }

    const productId = toPositiveIntOrNull(body?.productId);
    if (body?.productId !== undefined && body?.productId !== null && body?.productId !== '' && !productId) {
        errors.productId = 'productId must be a positive integer';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: {
            messageType,
            name,
            email,
            phone: phone || null,
            recipientEmail: recipientEmail || null,
            subject,
            message,
            orderId,
            productId
        }
    };
}

function validateUpdateMessageStatusPayload(body) {
    const errors = {};
    const status = normalizeString(body?.status).toLowerCase();
    if (!status) errors.status = 'Status is required';
    else if (!ALLOWED_MESSAGE_STATUSES.has(status)) errors.status = 'Invalid status';

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: { status }
    };
}

module.exports = {
    validateMessageIdParam,
    validateCreateMessagePayload,
    validateUpdateMessageStatusPayload
};

