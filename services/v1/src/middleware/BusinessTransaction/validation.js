/**
 * Request Validation module for BusinessTransaction endpoints.
 * @module src/middleware/BusinessTransaction/validation.js
 */
const Joi = require('joi');

// creating a new business transaction.
module.exports = {
  createBusinessTransactionSchema: Joi.object({
    businessID: Joi.number().required(),
    customerID: Joi.number().required(),
    productID: Joi.number().required(),
    // (NOT IN V1) Not required in case they don't have it set up on Coinbase
    // twoFactorAuthToken: Joi.string(),
    sku: Joi.string().required(),
    productCategory: Joi.string().required(),
    quantity: Joi.number().required(),
    currency: Joi.string().required(),
    latitude: Joi.number(),
    longitude: Joi.number(),
  }),
  listBusinessTransactionsSchema: Joi.object({
    customerID: Joi.number(),
    businessID: Joi.number(),
    queryAttributes: Joi.object()
      .keys({
        coinbaseTransactionID: Joi.string(),
        customerID: Joi.number(),
        businessID: Joi.number(),
        productID: Joi.number(),
        amount: Joi.number(),
        token_amount: Joi.number(),
        productCategory: Joi.string(),
        quantity: Joi.number(),
        currency: Joi.string(),
        latitude: Joi.number(),
        longitude: Joi.number(),
        order: Joi.string().valid('ASC', 'DESC'),
        offset: Joi.number(),
        limit: Joi.number(),
      })
      .required(),
  }),
  fetchBusinessTransactionSchema: Joi.object({
    transactionID: Joi.string().required(),
    coinbaseTransactionID: Joi.string().required(),
    customerID: Joi.number().required(),
    businessID: Joi.number().required(),
    productID: Joi.number().required(),
  }),
};
