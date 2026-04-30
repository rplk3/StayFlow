// DEPRECATED: This old Payment model has been replaced by the one in
// src/modules/payment/models/Payment.js
// Keeping this file to avoid import errors in legacy code, but it now
// re-exports the new model.

const Payment = require('../src/modules/payment/models/Payment');
module.exports = Payment;
