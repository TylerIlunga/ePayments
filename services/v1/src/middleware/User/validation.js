/**
 * Request Validation module for User endpoints.
 * @module src/middleware/User/validation.js
 */
const Joi = require('joi');
const { VALIDATION } = require('../../config');

module.exports = {
  activateAccountSchema: Joi.object({
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'org', 'edu'] },
    }),
    activationToken: Joi.string(),
  }).with('email', 'activationToken'),
  forgotPasswordSchema: Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net', 'org', 'edu'] },
      })
      .required(),
  }),
  resetPasswordSchema: Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net', 'org', 'edu'] },
      })
      .required(),
    resetPasswordToken: Joi.string().required(),
    newPassword: Joi.string().required(),
  }),
};
