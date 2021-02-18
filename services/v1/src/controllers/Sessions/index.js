/**
 * Sessions Controller module.
 * @module src/controllers/Sessions/index.js
 */
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const generalConfig = require('../../config');
const { User } = require('../../dal/config');
const { Errors, Generators, Tokens } = require('../../utils');
const {
  tokenHasExpired,
  signUpLogInBodySchema,
  extractErrorMessage,
} = require('../Middleware/Session/validation');
const EmailSender = require('../../email');

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
   * Determines whether or not a user's session is still active based on their JWT.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {number} Network Status number
   */
  async reviewSession(req, res) {
    tokenHasExpired(req.headers.authorization, async (rsp) => {
      if (rsp.error) {
        return res.json({ error: rsp.error });
      }
      const user = await User.findOne({ where: { id: rsp.data.id } });
      if (user === null) {
        return res.json({
          error: 'Account does not exist for the given email.',
        });
      }
      if (!user.active) {
        return res.json({
          error: 'Please check your email and activate your account.',
        });
      }
      return res.json({
        error: null,
        user: removeSensitiveUserData(user),
      });
    });
  },
  /**
   * Creates a new account and a session for a new user.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async signUp(req, res) {
    // 1) Create User(service)
    // 2) Send out email(service) to verify user account
    // 3) End
    const validationResult = signUpLogInBodySchema.validate(req.body);
    if (validationResult.error) {
      Errors.General.logError(validationResult.error);
      let error = extractErrorMessage(validationResult.error);
      if (error == null) {
        error = Errors.Network.invalidRequest();
      }
      return res.json({ error });
    }
    try {
      let { email, password } = validationResult.value;
      let user = await User.findOne({ where: { email } });
      if (user !== null) {
        throw { error: 'Account exists for the given email.' };
      }

      let activationToken = await crypto.randomBytes(127);
      activationToken = activationToken.toString('hex');

      password = await Generators.generatePassword(password);
      user = await User.create({
        email,
        password,
        activation_token: activationToken,
      });
      console.log('New User Created:', user.id);

      const eRes = await EmailSender.sendActivateAccountEmail(user);
      if (eRes.error) {
        throw eRes.error;
      }

      console.log('email sent to new user!');
      return res.json({ error: null, user });
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
  /**
   * Creates a new session for an existing user.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {number} JSON object
   */
  async logIn(req, res) {
    // Validate
    const validationResult = signUpLogInBodySchema.validate(req.body);
    if (validationResult.error) {
      Errors.General.logError(validationResult.error);
      let error = extractErrorMessage(validationResult.error);
      if (error == null) {
        error = Errors.Network.invalidRequest();
      }
      return res.json({ error });
    }
    try {
      const { email, password } = validationResult.value;
      // Check if user exists via email
      const user = await User.findOne({ where: { email } });
      if (user === null) {
        throw { error: 'Account does not exist for the given email.' };
      }
      // Check if user activated their account.
      if (!user.active) {
        throw { error: 'Please check your email and activate your account.' };
      }
      // Check if password matches
      bcrypt.compare(password, user.password, async (error, isMatch) => {
        if (error) {
          throw { error: 'Error comparing passwords:' + error };
        }
        if (!isMatch) {
          throw { error: 'Incorrect password. Please try again.' };
        }
        // Create session token (JWT)
        const sessionToken = Tokens.signToken({ id: user.id });
        console.log(sessionToken);
        res.cookie('ut', sessionToken, {
          maxAge: Date.now() + generalConfig.JWT.expirationInSecs,
          httpOnly: true,
        });
        // Return user data not profile.
        return res.json({ user: removeSensitiveUserData(user), error: null });
      });
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
};
