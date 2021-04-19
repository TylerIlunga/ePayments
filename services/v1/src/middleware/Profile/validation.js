/**
 * Request Validation module for user Profile endpoints.
 * @module src/middleware/Profile/validation.js
 */
const Joi = require('joi');

module.exports = {
  fetchProfileSchema: Joi.object({
    userID: Joi.number().required(),
  }),
  customerCreationSchema: Joi.object({
    country: Joi.string().required(),
    username: Joi.string().required(),
    userID: Joi.number().required(),
  }),
  businessCreationSchema: Joi.object({
    legalName: Joi.string().required(),
    industry: Joi.string().required(),
    country: Joi.string().required(),
    address: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    publicEmail: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net', 'org', 'edu'] },
      })
      .required(),
    userID: Joi.number().required(),
  }),
  customerUpdateSchema: Joi.object().keys({
    userID: Joi.number().required(),
    profileID: Joi.number().required(),
    updates: Joi.object()
      .keys({
        country: Joi.string(),
        username: Joi.string(),
      })
      .required(),
  }),
  businessUpdateSchema: Joi.object({
    userID: Joi.number().required(),
    profileID: Joi.number().required(),
    updates: Joi.object()
      .keys({
        address: Joi.string(),
        phoneNumber: Joi.string(),
        publicEmail: Joi.string().email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'net', 'org', 'edu'] },
        }),
      })
      .required(),
  }),
};
