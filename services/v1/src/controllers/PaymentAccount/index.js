/**
 * PaymentAccount Controller module.
 * @module src/controllers/PaymentAccount/index.js
 */
const generalConfig = require('../../config');
const { PaymentAccount } = require('../../dal/config');
const { Validation, CoinbaseAPIHelper } = require('../../utils');
const {
  fetchPaymentAccountSchema,
  createPaymentAccountSchema,
  createPaymentAccountOauthCallbackSchema,
  updatePaymentAccountSchema,
  deletePaymentAccountSchema,
} = require('../middleware/PaymentAccount/validation');

module.exports = {
  /**
   * Fetches connected third-party (Stripe, Coinbase) payment account information
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async fetchPaymentAccount(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      fetchPaymentAccountSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      return res.json({ error: null, success: true });
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
  /**
   * Creates a new payment account for the given user
   * and connects to third-party (Stripe, Coinbase) services.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async createPaymentAccountStart(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      createPaymentAccountSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const coinbaseAPI = new CoinbaseAPIHelper();
      return coinbaseAPI.authorizeUser(res);
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
  /**
   * (POST CB-OAUTH CALLBACK)
   * Creates a new payment account for the given user
   * and connects to third-party (Stripe, Coinbase) services.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async createPaymentAccountOAuthCodeCallback(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      createPaymentAccountOauthCallbackSchema,
      req.query,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    const coinbaseAPI = new CoinbaseAPIHelper();
    coinbaseAPI
      .getAccessToken(req.query.code)
      .then((cbRes) => {
        console.log('coinbaseAPI.getAccessToken() then:', cbRes);
        if (cbRes.error) {
          Errors.General.logError(cbRes.error);
          return res.json(cbRes.error);
        }
        const accessTokenData = cbRes.data;
        // TODO: Persist accessTokenData.access_token, accessTokenData.expires_in, accessTokenData.refresh_token
        return res.json({ error: null, success: true, accessTokenData });
      })
      .catch((error) => {
        console.log('coinbaseAPI.getAccessToken() error:', error);
        Errors.General.logError(error);
        return res.json(error);
      });
  },
  /**
   * Updates a given user's persisted payment account.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async updatePaymentAccount(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      updatePaymentAccountSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      return res.json({ error: null, success: true });
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
  /**
   * Deletes a persisted payment account for a given user
   * along with any created third-party information.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async deletePaymentAccount(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      deletePaymentAccountSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      return res.json({ error: null, success: true });
    } catch (error) {
      Errors.General.logError(error);
      return res.json(error);
    }
  },
};
