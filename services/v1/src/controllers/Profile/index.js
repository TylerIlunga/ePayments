/**
 * Controller module for user Profile endpoints.
 * @module src/controllers/Profile/validation.js
 */
const { BusinessProfile, CustomerProfile, User } = require('../../dal/config');
const {
  fetchProfileSchema,
  customerCreationSchema,
  businessCreationSchema,
  customerUpdateSchema,
  businessUpdateSchema,
} = require('../../middleware/Profile/validation');
const { Errors, Strings, Validation } = require('../../utils');

module.exports = {
  async fetchProfile(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      fetchProfileSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const { userID } = validationResult.value;
      // Customer Profile?
      const customerProfile = await CustomerProfile.findOne({
        where: { user_id: userID },
      });
      if (customerProfile !== null) {
        return res.json({ error: null, profile: customerProfile });
      }
      // Business Profile?
      const businessProfile = await BusinessProfile.findOne({
        where: { user_id: userID },
      });
      if (businessProfile !== null) {
        return res.json({ error: null, profile: businessProfile });
      }
      return res.json({ error: null, profile: null });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
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
      const { country, username, userID } = validationResult.value;
      // Verify if a user and business profile already exists
      const customerUser = await User.findOne({ where: { id: userID } });
      if (customerUser === null) {
        throw { error: 'User does not exist for the given ID.' };
      }
      const customerProfile = await CustomerProfile.findOne({
        where: { user_id: userID },
      });
      if (customerProfile !== null) {
        throw { error: 'Profile already exists for the given ID.' };
      }
      // Persist a new customer profile
      const newCustomerProfile = await CustomerProfile.create({
        country,
        username,
        user_id: userID,
      });
      console.log('new customer profile created! ID:', newCustomerProfile.id);
      res.json({
        error: null,
        success: true,
        profile: newCustomerProfile,
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
        legalName,
        industry,
        country,
        address,
        phoneNumber,
        publicEmail,
        userID,
      } = validationResult.value;
      // Verify if a user and business profile already exists
      const businessUser = await User.findOne({ where: { id: userID } });
      if (businessUser === null) {
        throw { error: 'User does not exist for the given ID.' };
      }
      const businessProfile = await BusinessProfile.findOne({
        where: { user_id: userID },
      });
      if (businessProfile !== null) {
        throw { error: 'Profile already exists for the given ID.' };
      }
      // Persist a new business profile
      const newBusinessProfile = await BusinessProfile.create({
        address,
        industry,
        country,
        legal_name: legalName,
        phone_number: phoneNumber,
        public_email: publicEmail,
        user_id: userID,
      });
      console.log('new business profile created! ID:', newBusinessProfile.id);

      // Update User Account
      businessUser.type = 'business';

      await businessUser.save();

      res.json({
        error: null,
        success: true,
        profile: newBusinessProfile,
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
