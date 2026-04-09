const parseImageList = (imageUrls) => {
    if (!imageUrls) return [];

    if (Array.isArray(imageUrls)) {
        return imageUrls.map(url => String(url).trim()).filter(Boolean);
    }

    if (typeof imageUrls === 'string') {
        return imageUrls
            .split(',')
            .map(url => url.trim())
            .filter(Boolean);
    }

    return [];
};

const stripToPathname = (url) => {
    if (!url) return '';

    const trimmed = String(url).trim();
    if (!trimmed) return '';

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        try {
            return new URL(trimmed).pathname;
        } catch (error) {
            return trimmed;
        }
    }

    return trimmed;
};

const normalizeUploadPath = (url, folder = 'products') => {
    const cleanUrl = stripToPathname(url);

    if (!cleanUrl) return '';

    if (cleanUrl.startsWith('/uploads/')) {
        return cleanUrl;
    }

    if (cleanUrl.startsWith('/')) {
        return cleanUrl;
    }

    return `/uploads/${folder}/${cleanUrl}`;
};

const normalizeImageUrls = (imageUrls, folder = 'products') => {
    return parseImageList(imageUrls)
        .map(url => normalizeUploadPath(url, folder))
        .filter(Boolean);
};

const imageUrlsToString = (imageUrls, folder = 'products') => {
    return normalizeImageUrls(imageUrls, folder).join(',');
};

module.exports = {
    parseImageList,
    stripToPathname,
    normalizeUploadPath,
    normalizeImageUrls,
    imageUrlsToString
};