export const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Free';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(price);
}; 