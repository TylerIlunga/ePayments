/**
 * Controller module for User endpoints.
 * @module src/controllers/User/index.js
 */
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const generalConfig = require('../../config');
const { User } = require('../../dal/config');
const { Errors, Generators, Validation } = require('../../utils');
const {
  activateAccountSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../middleware/User/validation');
const EmailSender = require('../../email');

module.exports = {
  /**
   * Activates a new user's account.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async activateAccount(req, res) {
    // Validate
    const validationResult = Validation.validateRequestBody(
      activateAccountSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      // Check to see if email and activation token exists for the given user.
      const { email, resetToken } = validationResult.value;
      const user = await User.findOne({
        where: { email, activation_token: resetToken },
      });
      if (user === null) {
        throw { error: 'Account can not be found for the given information.' };
      }
      // If so, remove resetToken + set Account to active
      user.activation_token = null;
      await user.save();

      return res.json({ success: true, error: null });
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
  /**
   * Creates a password reset token for a given user.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async forgotPassword(req, res) {
    // Validate
    const validationResult = Validation.validateRequestBody(
      forgotPasswordSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      // Check to see if email exists for the given user.
      const { email } = validationResult.value;
      const user = await User.findOne({ where: { email } });
      if (user === null) {
        throw { error: 'Account can not be found for the given information.' };
      }
      // If so, create a password reset token and store it
      let resetToken = await crypto.randomBytes(127);
      resetToken = resetToken.toString('hex');

      user.password_reset_token = resetToken;
      user.password_reset_expiry =
        Date.now() + generalConfig.PASSWORDS.resetExpiry;
      await user.save();

      // Send out an email with the password reset token
      const eRes = await EmailSender.sendResetPasswordEmail(user);
      if (eRes.error) {
        throw eRes.error;
      }

      console.log('resetPassword email sent to new user!');
      return res.json({ error: null, success: true });
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
  /**
   * Updates a user's password for the given password reset token.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async resetPassword(req, res) {
    // Validate
    const validationResult = Validation.validateRequestBody(
      resetPasswordSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }

    try {
      // Check to see if email and password reset token exists for the given user.
      const {
        email,
        resetPasswordToken,
        oldPassword,
        newPassword,
      } = validationResult.value;
      const user = await User.findOne({
        where: { email, password_reset_token: resetPasswordToken },
      });
      if (user === null) {
        throw { error: 'Account can not be found for the given information.' };
      }
      // Check to see if reset token expired.
      if (user.password_reset_expiry >= Date.now()) {
        throw {
          error: 'Password Reset Token expired. Please request a new one.',
        };
      }
      // Check if oldPassword matches stored password
      bcrypt.compare(oldPassword, user.password, async (error, isMatch) => {
        if (error) {
          return res.json({ error: 'Error comparing passwords:' + error });
        }
        if (!isMatch) {
          return res.json({ error: 'Incorrect password. Please try again.' });
        }
        // Update Password and remove Reset Data
        user.password = await Generators.generatePassword(newPassword);
        user.password_reset_token = null;
        user.password_reset_expiry = null;
        await user.save();

        // Return user data not profile.
        return res.json({ error: null, success: true });
      });
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
};
