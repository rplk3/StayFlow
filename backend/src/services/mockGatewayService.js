/**
 * Process a mock payment
 * Rules:
 * - If cardNumber ends with "0" => FAILED
 * - If cardNumber ends with "1" => PENDING
 * - Else => SUCCESS
 */
const processMockPayment = (cardNumber, amount) => {
    if (!cardNumber) {
        throw new Error('Card number is required');
    }

    const lastChar = String(cardNumber).slice(-1);
    let status = 'SUCCESS';

    if (lastChar === '0') {
        status = 'FAILED';
    } else if (lastChar === '1') {
        status = 'PENDING';
    }

    return {
        status,
        transactionRef: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        amount,
        gatewayResponse: `Transacted successfully via Mock Gateway. Code: ${status}`
    };
};

module.exports = {
    processMockPayment
};
