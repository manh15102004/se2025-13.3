/**
 * Format price to Vietnamese currency format
 * Example: 160000 -> "160.000 đ"
 */
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

/**
 * Format price without currency symbol
 * Example: 160000 -> "160.000"
 */
export const formatPriceNumber = (price: number): string => {
    return new Intl.NumberFormat('vi-VN').format(price);
};

/**
 * Format price in short form (k for thousands)
 * Example: 160000 -> "160k"
 */
export const formatPriceShort = (price: number): string => {
    if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1)}M`;
    }
    return `${(price / 1000).toFixed(0)}k`;
};
