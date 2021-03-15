const generalConfig = require('../../config');
const { BusinessProfile, CustomerProfile } = require('../../dal/config');
const {
  customerCreationSchema,
  businessCreationSchema,
  customerUpdateSchema,
  businessUpdateSchema,
} = require('../Middleware/Profile/validation');
const {
  AWS: { S3Utils },
  Errors,
  Validation,
} = require('../../utils');

module.exports = {
  async customerCreation(req, res) {
    const validationResult = Validation.validateRequestBody(
      customerCreationSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const {
        profileImage,
        country,
        username,
        userID,
      } = validationResult.value;
      // Store image in cloud
      const s3ImgUrl = await S3Utils.upload(
        null,
        'customer',
        userID,
        profileImage,
      );
      // Store link, country, username;
      const newCustomerProfile = await CustomerProfile.create({
        country,
        username,
        user_id: userID,
        profile_image_url: s3ImgUrl,
      });
      console.log('new customer profile created! ID:', newCustomerProfile.id);
      res.json({
        error: null,
        success: true,
        customerProfileID: newCustomerProfile.id,
      });
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
  businessCreation(req, res) {
    // NEED: User ID, address, phone_number, public_email, etc.
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
    // NOTE: Just check to see that body contains valid properties in database schema w/ validation schema
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
    // NOTE: Just check to see that body contains valid properties in database schema w/ validation schema
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
