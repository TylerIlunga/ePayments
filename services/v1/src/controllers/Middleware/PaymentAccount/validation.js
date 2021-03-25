/**
 * PaymentAccount (request) Validation module
 * @module src/controllers/middleware/PaymentAccount/validation.js
 */
const Joi = require('joi');

const genericRequirements = {
  userID: Joi.string().required(),
  profileID: Joi.string().required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ['com', 'net', 'org', 'edu'] },
  }),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{10,30}$')),
};
const oAuthCallbackStateSchema = {
  userID: Joi.string().required(),
  profileID: Joi.string().required(),
};

module.exports = {
  fetchPaymentAccountSchema: Joi.object(genericRequirements),
  createPaymentAccountSchema: Joi.object(oAuthCallbackStateSchema),
  createPaymentAccountOauthCallbackSchema: Joi.object({
    state: Joi.string().required(),
    code: Joi.string().required(),
  }),
  createPaymentAccountOauthStateSchema: Joi.object(oAuthCallbackStateSchema),
  updatePaymentAccountSchema: Joi.object(genericRequirements),
  deletePaymentAccountSchema: Joi.object(genericRequirements),
};
