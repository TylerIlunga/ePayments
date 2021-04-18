/**
 * PaymentAccount (request) Validation module
 * @module src/middleware/PaymentAccount/validation.js
 */
const Joi = require('joi');

module.exports = {
  fetchPaymentAccountSchema: Joi.object({
    userID: Joi.number().required(),
    profileID: Joi.number().required(),
  }),
  createPaymentAccountSchema: Joi.object({
    // NOTE: IDs are strings since we are populating their values in a url string
    userID: Joi.string().required(),
    profileID: Joi.string().required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net', 'org', 'edu'] },
      })
      .required(),
    replaceAccount: Joi.boolean().required(),
  }),
  createPaymentAccountOauthCallbackSchema: Joi.object({
    state: Joi.string().required(),
    code: Joi.string().required(),
  }),
  toggleAutoConvertToFiatFeatureSchema: Joi.object({
    id: Joi.number().required(),
    userID: Joi.number().required(),
    profileID: Joi.number().required(),
    autoConvertToFiatStatus: Joi.boolean().required(),
  }),
};
