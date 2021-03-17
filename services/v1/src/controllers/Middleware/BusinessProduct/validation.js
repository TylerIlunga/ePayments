// TODO: JSDOC Module Header
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
};
