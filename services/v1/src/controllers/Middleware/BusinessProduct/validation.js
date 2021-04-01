/**
 * Request Validation module for BusinessProduct endpoints.
 * @module src/controllers/middleware/BusinessProduct/validation.js
 */
const Joi = require('joi');

module.exports = {
  createBusinessProductSchema: Joi.object({
    userID: Joi.number().required(),
    sku: Joi.string().length(16).required(),
    label: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    inventoryCount: Joi.number().required(),
  }),
  listBusinessProductsSchema: Joi.object({
    userID: Joi.number().required(),
    queryAttributes: Joi.object()
      .keys({
        sku: Joi.string().length(16),
        label: Joi.string(),
        description: Joi.string(),
        price: Joi.number(),
        inventoryCount: Joi.number(),
        viewCount: Joi.number(),
        purchasedCount: Joi.number(),
        order: Joi.string().valid('ASC', 'DESC'),
        offset: Joi.number(),
        limit: Joi.number(),
      })
      .required(),
  }),
  fetchBusinessProductSchema: Joi.object({
    userID: Joi.number().required(),
    businessProductID: Joi.number().required(),
    sku: Joi.string().length(16).required(),
  }),
  updateBusinessProductSchema: Joi.object({
    userID: Joi.number().required(),
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
    userID: Joi.number().required(),
    businessProductID: Joi.number().required(),
    sku: Joi.string().length(16).required(),
  }),
};
