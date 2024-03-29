/**
 * Controller module for user Session endpoints.
 * @module src/controllers/Session/index.js
 */
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const generalConfig = require('../../config');
const dalConfig = require('../../dal/config');
const EmailSender = require('../../email');
const {
  signUpLogInBodySchema,
  fetchUserSessionData,
} = require('../../middleware/Session/validation');
const {
  Errors,
  Generators,
  Tokens,
  Strings,
  Validation,
} = require('../../utils');

// NOTE: Use .mjs for new syntax? Or newer version of Node.js

const removeSensitiveUserData = (user) => {
  user.password = null;
  user.activation_token = null;
  user.password_reset_token = null;
  user.password_reset_expiry = null;
  user.two_factor_secret = null;
  user.two_factor_backup = null;
  return user;
};

module.exports = {
  /**
   * Creates a new account for a new user.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async signUp(req, res) {
    const validationResult = Validation.validateRequestBody(
      signUpLogInBodySchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      let { email, password } = validationResult.value;
      let user = await dalConfig.User.findOne({ where: { email } });
      if (user !== null) {
        throw { error: 'Account exists for the given email.' };
      }

      let activationToken = await crypto.randomBytes(127);
      activationToken = activationToken.toString('hex');

      password = await Generators.generatePassword(password);
      user = await dalConfig.User.create({
        email,
        password,
        activation_token: activationToken,
      });
      console.log('New User Created:', user.id);

      const eRes = await EmailSender.sendActivateAccountEmail(user);
      if (eRes.error) {
        throw eRes.error;
      }

      console.log('activateAccount email sent to new user!');
      return res.json({ error: null, user });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
  /**
   * Creates a new session for an existing user.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async logIn(req, res) {
    // Validate
    const validationResult = Validation.validateRequestBody(
      signUpLogInBodySchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const { email, password } = validationResult.value;
      // Check if user exists via email
      const user = await dalConfig.User.findOne({ where: { email } });
      if (user === null) {
        throw { error: 'Account does not exist for the given email.' };
      }
      // Check if password matches
      bcrypt.compare(password, user.password, async (error, isMatch) => {
        if (error) {
          return res.json({ error: 'Error comparing passwords:' + error });
        }
        if (!isMatch) {
          return res.json({ error: 'Incorrect password. Please try again.' });
        }
        // Check if user activated their account.
        if (!user.active) {
          return res.json({
            error:
              'Please check your email for your token to activate your account.',
          });
        }
        // Create session token (JWT)
        const sessionToken = Tokens.signToken({ userID: user.id });
        res.cookie('ut', sessionToken, {
          expires: new Date(
            new Date().getTime() + generalConfig.JWT.expirationInSecs,
          ),
          // Disable Document.cookie API
          httpOnly: process.env.NODE_ENV === 'production',
          // Sent only to the server using HTTPS protocol
          secure: process.env.NODE_ENV === 'production',
        });
        // Return user data not profile.
        return res.json({ user: removeSensitiveUserData(user), error: null });
      });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
  /**
   * Logs a user out by destoying their session token cookie.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {number} HTTP Status Code
   */
  async logOut(req, res) {
    res.clearCookie('ut');
    res.sendStatus(200);
  },
};
