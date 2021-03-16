// TODO: JSDOC Module Header
const Joi = require('joi');

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
    oldPassword: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{10,30}$'))
      .required(),
    newPassword: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9]{10,30}$'))
      .required(),
  }),
};
