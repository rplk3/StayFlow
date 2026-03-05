const calculateBilling = (checkInDate, checkOutDate, basePricePerNight, extras = [], discount = 0) => {
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);

    // Calculate nights difference, must be at least 1
    const timeDifference = outDate.getTime() - inDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    const nights = Math.max(1, daysDifference);

    // Extras total
    const extrasTotal = extras.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    // Subtotal
    const subtotal = (nights * Number(basePricePerNight)) + extrasTotal;

    // Taxes and fees
    const tax = subtotal * 0.10;
    const serviceCharge = subtotal * 0.05;

    // Grand total
    const total = subtotal + tax + serviceCharge - Number(discount);

    return {
        nights,
        basePricePerNight: Number(basePricePerNight),
        extrasTotal,
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        serviceCharge: Number(serviceCharge.toFixed(2)),
        discount: Number(Number(discount).toFixed(2)),
        total: Number(total.toFixed(2))
    };
};

module.exports = {
    calculateBilling
};
