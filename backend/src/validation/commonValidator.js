const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const toPositiveInt = (value) => {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) return null;
    return n;
};

const toInt = (value) => {
    const n = Number(value);
    if (!Number.isInteger(n)) return null;
    return n;
};

const toNumber = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
};

const toNonNegativeInt = (value) => {
    const n = toInt(value);
    if (n === null || n < 0) return null;
    return n;
};

const toOptionalBool01 = (value) => {
    if (value === undefined || value === null) return undefined;
    if (value === true || value === 'true' || value === 1 || value === '1') return 1;
    if (value === false || value === 'false' || value === 0 || value === '0') return 0;
    return null;
};

module.exports = {
    isNonEmptyString,
    normalizeString,
    toPositiveInt,
    toInt,
    toNumber,
    toNonNegativeInt,
    toOptionalBool01
};