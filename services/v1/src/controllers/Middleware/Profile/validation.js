const Joi = require('joi');

module.exports = {
  customerCreationSchema: Joi.object({
    profileImage: Joi.string().required(),
    country: Joi.string().required(),
    username: Joi.string().required(),
    userID: Joi.number().required(),
  }),
  // NEED: User ID, address, phone_number, public_email, etc.
  businessCreationSchema: Joi.object({
    profileImage: Joi.string().required(),
    address: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    publicEmail: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'org', 'edu'] },
    }),
    userID: Joi.number().required(),
  }),
  customerUpdateSchema: Joi.object().keys({
    updates: Joi.object().keys({
      profileImage: Joi.func(),
      username: Joi.string(),
    }),
  }),
  businessUpdateSchema: Joi.object().keys({
    updates: Joi.object().keys({
      profileImage: Joi.func(),
      username: Joi.string(),
    }),
  }),
};
