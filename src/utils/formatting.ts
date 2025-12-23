export const formatPrice = (price: number | string | undefined | null): string => {
    if (price === undefined || price === null) return '0 đ';
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice)) return '0 đ';
    return Math.round(numericPrice).toLocaleString('vi-VN') + ' đ';
};
