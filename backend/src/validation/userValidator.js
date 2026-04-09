const { isNonEmptyString, normalizeString } = require('./commonValidator');
const { isValidEmail, isStrongEnoughPassword, isValidPhoneNumber } = require('./formValidation');

const validateSignupPayload = (payload) => {
    const errors = {};

    const full_name = normalizeString(payload.full_name);
    const email = normalizeString(payload.email);
    const password = payload.password;
    const phone_number = payload.phone_number;

    if (!isNonEmptyString(full_name)) {
        errors.full_name = 'Full name is required';
    }

    if (!isValidEmail(email)) {
        errors.email = 'Valid email is required';
    }

    if (!isStrongEnoughPassword(password, 6)) {
        errors.password = 'Password must be at least 6 characters long';
    }

    if (!isValidPhoneNumber(phone_number)) {
        errors.phone_number = 'Phone number is invalid';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: {
            full_name,
            email,
            address: payload.address || null,
            phone_number: phone_number ? String(phone_number).trim() : null,
            password
        }
    };
};

const validateLoginPayload = (payload) => {
    const errors = {};

    const email = normalizeString(payload.email);
    const password = payload.password;

    if (!isValidEmail(email)) {
        errors.email = 'Valid email is required';
    }

    if (!isNonEmptyString(password)) {
        errors.password = 'Password is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: { email, password }
    };
};

const validateForgotPasswordPayload = (payload) => {
    const errors = {};
    const email = normalizeString(payload.email);

    if (!isValidEmail(email)) {
        errors.email = 'Valid email is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: { email }
    };
};

const validateResetPasswordPayload = (payload) => {
    const errors = {};

    const email = normalizeString(payload.email);
    const code = normalizeString(payload.code);
    const newPassword = payload.newPassword;
    const confirmPassword = payload.confirmPassword;

    if (!isValidEmail(email)) {
        errors.email = 'Valid email is required';
    }

    if (!isNonEmptyString(code)) {
        errors.code = 'Reset code is required';
    }

    if (!isStrongEnoughPassword(newPassword, 6)) {
        errors.newPassword = 'Password must be at least 6 characters long';
    }

    if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: { email, code, newPassword, confirmPassword }
    };
};

const validateProfilePayload = (payload) => {
    const errors = {};

    const full_name = payload.full_name !== undefined ? normalizeString(payload.full_name) : undefined;
    const phone_number = payload.phone_number !== undefined ? String(payload.phone_number).trim() : undefined;

    if (full_name !== undefined && !isNonEmptyString(full_name)) {
        errors.full_name = 'Full name cannot be empty';
    }

    if (phone_number !== undefined && !isValidPhoneNumber(phone_number)) {
        errors.phone_number = 'Phone number is invalid';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: { full_name, phone_number }
    };
};

const validateAddressPayload = (payload) => {
    const errors = {};

    const house_number = normalizeString(payload.house_number);
    const street = normalizeString(payload.street);
    const city = normalizeString(payload.city);
    const zipcode = normalizeString(payload.zipcode);

    if (!isNonEmptyString(house_number)) {
        errors.house_number = 'House number is required';
    }

    if (!isNonEmptyString(street)) {
        errors.street = 'Street is required';
    }

    if (!isNonEmptyString(city)) {
        errors.city = 'City is required';
    }

    if (!isNonEmptyString(zipcode)) {
        errors.zipcode = 'Zipcode is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: { house_number, street, city, zipcode }
    };
};

const validateChangePasswordPayload = (payload) => {
    const errors = {};

    const currentPassword = payload.currentPassword;
    const newPassword = payload.newPassword;

    if (!isNonEmptyString(currentPassword)) {
        errors.currentPassword = 'Current password is required';
    }

    if (!isStrongEnoughPassword(newPassword, 6)) {
        errors.newPassword = 'New password must be at least 6 characters long';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: { currentPassword, newPassword }
    };
};

module.exports = {
    validateSignupPayload,
    validateLoginPayload,
    validateForgotPasswordPayload,
    validateResetPasswordPayload,
    validateProfilePayload,
    validateAddressPayload,
    validateChangePasswordPayload
};

