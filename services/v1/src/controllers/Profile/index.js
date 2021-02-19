const generalConfig = require('../../config');
const { BusinessProfile, CustomerProfile } = require('../../dal/config');
const {
  customerCreationSchema,
  businessCreationSchema,
  customerUpdateSchema,
  businessUpdateSchema,
} = require('../Middleware/Profile/validation');
const { Errors, Validation } = require('../../utils');

module.exports = {
  customerCreation(req, res) {
    const validationResult = Validation.validateRequestBody(
      customerCreationSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      res.json({});
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
  businessCreation(req, res) {
    const validationResult = Validation.validateRequestBody(
      businessCreationSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      res.json({});
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
  customerUpdate(req, res) {
    const validationResult = Validation.validateRequestBody(
      customerUpdateSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      res.json({});
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
  businessUpdate(req, res) {
    const validationResult = Validation.validateRequestBody(
      businessUpdateSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      res.json({});
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
};
