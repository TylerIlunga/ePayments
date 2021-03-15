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
    // Validate Input
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
      // Store image in the cloud (AWS)
      const s3ImgUrl = await S3Utils.profileImageUpload(
        null,
        'customers',
        userID,
        profileImage,
      );
      // Persist a new customer profile
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
  async businessCreation(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      businessCreationSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const {
        profileImage,
        address,
        phoneNumber,
        publicEmail,
        userID,
      } = validationResult.value;
      // Store image in the cloud (AWS)
      const s3ImgUrl = await S3Utils.profileImageUpload(
        null,
        'businesses',
        userID,
        profileImage,
      );
      // Persist a new business profile
      const newBusinessProfile = await BusinessProfile.create({
        address,
        phone_number: phoneNumber,
        public_email: publicEmail,
        user_id: userID,
        profile_image_url: s3ImgUrl,
      });
      console.log('new business profile created! ID:', newBusinessProfile.id);
      res.json({
        error: null,
        success: true,
        businessProfileID: newBusinessProfile.id,
      });
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
