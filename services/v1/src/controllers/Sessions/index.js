/**
 * Sessions Controller module.
 * @module src/controllers/Sessions/index.js
 */
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const { User } = require('../../dal/config');
const { Errors, Generators } = require('../../utils');
const {
  tokenHasExpired,
  signUpLogInBodySchema,
} = require('../Middleware/Session/validation');
const EmailSender = require('../../email');
module.exports = {
  /**
   * Determines whether or not a user's session is still active based on their JWT.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {number} Network Status number
   */
  reviewSession(req, res) {
    tokenHasExpired(req.headers.authorization, ({ session, user }) => {
      res.json({
        session,
        user: session ? user : null,
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
      return res.json({ error: Errors.Network.invalidRequest() });
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
  logIn(req, res) {
    res.send(200);
  },
};
