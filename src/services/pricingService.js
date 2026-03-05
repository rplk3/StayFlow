const { timeToMinutes } = require('./availabilityService');

const TAX_RATE = 0.10; // 10% tax

/**
 * Calculate duration in hours (supports half hours)
 */
function calculateDuration(startTime, endTime) {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    return (endMin - startMin) / 60;
}

/**
 * Calculate hall cost based on price model
 */
function calculateHallCost(hall, durationHours) {
    if (hall.priceModel === 'PER_HOUR') {
        return durationHours * (hall.pricePerHour || 0);
    }
    return hall.fixedPrice || 0;
}

/**
 * Calculate total services cost
 */
function calculateServicesCost(services, guestsCount) {
    let total = 0;
    if (services.catering && services.catering.selected) {
        total += guestsCount * (services.catering.pricePerPerson || 0);
    }
    if (services.decoration && services.decoration.selected) {
        total += services.decoration.price || 0;
    }
    if (services.audioVisual && services.audioVisual.selected) {
        total += services.audioVisual.price || 0;
    }
    if (services.extraItems && services.extraItems.length > 0) {
        for (const item of services.extraItems) {
            total += (item.unitPrice || 0) * (item.qty || 0);
        }
    }
    return total;
}

/**
 * Calculate complete pricing breakdown
 */
function calculatePricing(hall, startTime, endTime, services, guestsCount) {
    const durationHours = calculateDuration(startTime, endTime);
    const hallCost = calculateHallCost(hall, durationHours);
    const servicesCost = calculateServicesCost(services, guestsCount);
    const subtotal = hallCost + servicesCost;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    return {
        hallCost: Math.round(hallCost * 100) / 100,
        servicesCost: Math.round(servicesCost * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        tax,
        total,
        durationHours
    };
}

module.exports = { calculatePricing, calculateDuration, calculateHallCost, calculateServicesCost, TAX_RATE };
