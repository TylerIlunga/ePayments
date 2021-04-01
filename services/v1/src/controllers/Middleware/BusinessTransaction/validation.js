/**
 * Request Validation module for BusinessTransaction endpoints.
 * @module src/controllers/middleware/BusinessTransaction/validation.js
 */
const Joi = require('joi');

const fetchRequirements = {
  transactionID: Joi.string().required(),
  coinbaseTransactionID: Joi.string().required(),
  customerID: Joi.number().required(),
  businessID: Joi.number().required(),
  productID: Joi.number().required(),
};
const listRequirements = {
  ...fetchRequirements,
  pageNumber: Joi.number().required(),
  pageSize: Joi.number().required(),
};

module.exports = {
  createBusinessTransactionSchema: Joi.object({
    businessID: Joi.number().required(),
    customerID: Joi.number().required(),
    productID: Joi.number().required(),
    // Not required in case they don't have it set up on Coinbase
    twoFactorAuthToken: Joi.string(),
    sku: Joi.string().required(),
    currency: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }),
  listBusinessTransactionsSchema: Joi.object(listRequirements),
  fetchBusinessTransactionSchema: Joi.object(fetchRequirements),
};
