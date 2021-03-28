/**
 * Request Validation module for BusinessTransaction endpoints.
 * @module src/controllers/middleware/BusinessTransaction/validation.js
 */
const Joi = require('joi');

const updateDeleteRequirements = {
  transactionID: Joi.number().required(),
  customerID: Joi.number().required(),
  businessID: Joi.number().required(),
  productID: Joi.number().required(),
};
const listFetchRequirements = {
  ...updateDeleteRequirements,
  pageNumber: Joi.number().required(),
  pageSize: Joi.number().required(),
};

module.exports = {
  createBusinessTransactionSchema: Joi.object({
    businessID: Joi.number().required(),
    customerID: Joi.number().required(),
    productID: Joi.number().required(),
    sku: Joi.string().required(),
    currency: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }),
  listBusinessTransactionsSchema: Joi.object(listFetchRequirements),
  fetchBusinessTransactionSchema: Joi.object(listFetchRequirements),
  updateBusinessTransactionSchema: Joi.object(updateDeleteRequirements),
  deleteBusinessTransactionSchema: Joi.object(updateDeleteRequirements),
};
