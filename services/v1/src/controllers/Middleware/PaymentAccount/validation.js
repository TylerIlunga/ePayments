// TODO: JSDOC Module Header
const Joi = require('joi');

module.exports = {
  fetchPaymentAccountSchema: Joi.object({}),
  createPaymentAccountSchema: Joi.object({}),
  createPaymentAccountOauthCallbackSchema: Joi.object({}),
  updatePaymentAccountSchema: Joi.object({}),
  deletePaymentAccountSchema: Joi.object({}),
};
