const { isNonEmptyString } = require('./commonValidator');

const isValidEmail = (email) => {
    if (!isNonEmptyString(email)) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

const isStrongEnoughPassword = (password, minLength = 6) => {
    return typeof password === 'string' && password.length >= minLength;
};

const isValidPhoneNumber = (phone) => {
    if (phone == null || phone === '') return true;
    return /^[0-9+\-\s()]{7,20}$/.test(String(phone).trim());
};

module.exports = {
    isValidEmail,
    isStrongEnoughPassword,
    isValidPhoneNumber
};

