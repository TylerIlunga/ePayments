/**
 * Request Validation module for BusinessProduct endpoints.
 * @module src/middleware/BusinessProduct/validation.js
 */
const Joi = require('joi');

// NOTE: Handling "category" field for all schemas
module.exports = {
  createBusinessProductSchema: Joi.object({
    businessID: Joi.number().required(),
    sku: Joi.string().length(16).required(),
    label: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    inventoryCount: Joi.number().required(),
  }),
  listBusinessProductsSchema: Joi.object({
    businessID: Joi.number().required(),
    queryAttributes: Joi.object()
      .keys({
        sku: Joi.string().length(16),
        label: Joi.string(),
        description: Joi.string(),
        price: Joi.number(),
        inventoryCount: Joi.number(),
        purchasedCount: Joi.number(),
        order: Joi.string().valid('ASC', 'DESC'),
        offset: Joi.number(),
        limit: Joi.number(),
      })
      .required(),
  }),
  fetchBusinessProductSchema: Joi.object({
    businessID: Joi.number().required(),
    businessProductID: Joi.number().required(),
    sku: Joi.string().length(16).required(),
  }),
  updateBusinessProductSchema: Joi.object({
    businessID: Joi.number().required(),
    businessProductID: Joi.number().required(),
    sku: Joi.string().length(16).required(),
    updates: Joi.object()
      .keys({
        label: Joi.string(),
        description: Joi.string(),
        price: Joi.number(),
        inventoryCount: Joi.number(),
      })
      .required(),
  }),
  deleteBusinessProductSchema: Joi.object({
    businessID: Joi.number().required(),
    businessProductID: Joi.number().required(),
    sku: Joi.string().length(16).required(),
  }),
};
