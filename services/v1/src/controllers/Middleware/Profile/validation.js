const Joi = require('joi');

module.exports = {
  customerCreationSchema: Joi.object({
    profileImageFile: Joi.func().required(),
    username: Joi.string().required(),
  }),
  businessCreationSchema: Joi.object({
    profileImageFile: Joi.func().required(),
    username: Joi.string().required(),
  }),
  customerUpdateSchema: Joi.object().keys({
    updates: Joi.object().keys({
      profileImageFile: Joi.func(),
      username: Joi.string(),
    }),
  }),
  businessUpdateSchema: Joi.object().keys({
    updates: Joi.object().keys({
      profileImageFile: Joi.func(),
      username: Joi.string(),
    }),
  }),
};
