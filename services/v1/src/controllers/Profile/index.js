/**
 * Controller module for user Profile endpoints.
 * @module src/controllers/Profile/validation.js
 */
const { BusinessProfile, CustomerProfile } = require('../../dal/config');
const {
  customerCreationSchema,
  businessCreationSchema,
  customerUpdateSchema,
  businessUpdateSchema,
} = require('../../middleware/Profile/validation');
const {
  AWS: { S3Utils },
  Errors,
  Strings,
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
      return Errors.General.serveResponse(error, res);
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
      return Errors.General.serveResponse(error, res);
    }
  },
  async customerUpdate(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      customerUpdateSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const { userID, profileID, updates } = validationResult.value;
      // Locate Customer Profile
      const customerProfile = await CustomerProfile.findOne({
        where: { id: profileID, user_id: userID },
      });
      if (customerProfile === null) {
        throw { error: 'Profile does not exist for the given ID.' };
      }
      // Iterate through updated profile features and apply to existing profile
      Object.keys(updates).forEach((profileFeature) => {
        if (
          updates[profileFeature] !== null &&
          updates[profileFeature] !== undefined
        ) {
          customerProfile[profileFeature] = updates[profileFeature];
        }
      });
      // Persist updated Customer Profile
      await customerProfile.save();
      return res.json({ error: null, success: true });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
  async businessUpdate(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      businessUpdateSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const { userID, profileID, updates } = validationResult.value;
      // Locate Business Profile
      const businessProfile = await BusinessProfile.findOne({
        where: { id: profileID, user_id: userID },
      });
      if (businessProfile === null) {
        throw { error: 'Profile does not exist for the given ID.' };
      }
      // Iterate through updated profile features and apply to existing profile
      Object.keys(updates).forEach((profileFeature) => {
        if (
          updates[profileFeature] !== null &&
          updates[profileFeature] !== undefined
        ) {
          businessProfile[Strings.camelToSnake(profileFeature)] =
            updates[profileFeature];
        }
      });
      // Persist updated Customer Profile
      await businessProfile.save();
      return res.json({ error: null, success: true });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
};
