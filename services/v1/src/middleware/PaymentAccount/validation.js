/**
 * PaymentAccount (request) Validation module
 * @module src/middleware/PaymentAccount/validation.js
 */
const Joi = require('joi');

const genericRequirements = {
  userID: Joi.string().required(),
  profileID: Joi.string().required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ['com', 'net', 'org', 'edu'] },
  }),
};

module.exports = {
  fetchPaymentAccountSchema: Joi.object(genericRequirements),
  createPaymentAccountOauthStateSchema: Joi.object(genericRequirements),
  updatePaymentAccountSchema: Joi.object(genericRequirements),
  deletePaymentAccountSchema: Joi.object(genericRequirements),
  createPaymentAccountSchema: Joi.object(genericRequirements),
  createPaymentAccountOauthCallbackSchema: Joi.object({
    state: Joi.string().required(),
    code: Joi.string().required(),
  }),
};
