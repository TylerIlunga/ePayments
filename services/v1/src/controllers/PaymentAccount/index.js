/**
 * Controller module for PaymentAccount endpoints.
 * @module src/controllers/PaymentAccount/index.js
 */
const generalConfig = require('../../config');
const dbModels = require('../../dal/config');
const {
  Validation,
  CoinbaseAPIHelper,
  Strings,
  Errors,
} = require('../../utils');
const {
  fetchPaymentAccountSchema,
  createPaymentAccountSchema,
  createPaymentAccountOauthCallbackSchema,
  updatePaymentAccountSchema,
  deletePaymentAccountSchema,
} = require('../../middleware/PaymentAccount/validation');

module.exports = {
  /**
   * (TODO): Fetches connected third-party (Stripe, Coinbase) payment account information
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
      return Errors.General.serveResponse(error, res);
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
      req.query,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const coinbaseAPI = new CoinbaseAPIHelper();
      return coinbaseAPI.authorizeUser(res, JSON.stringify(req.query));
    } catch (error) {
      return Errors.General.serveResponse(error, res);
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
    try {
      const { code, state } = req.query;
      const { email, userID, profileID } = JSON.parse(state);
      // Validate userID + profileID from state
      const user = await dbModels.User.findOne({
        where: { email, id: userID },
      });
      if (user == null) {
        throw { error: 'Account does not exist for the given user ID' };
      }
      const profileType = `${Strings.capitalize(user.type)}Profile`;
      console.log('user profile type:', profileType);
      const userProfile = await dbModels[profileType].findOne({
        where: { id: profileID, user_id: user.id },
      });
      if (userProfile == null) {
        throw { error: 'Profile does not exist for the given IDs' };
      }

      // Persist Coinbase Access Token Data
      const coinbaseAPI = new CoinbaseAPIHelper();
      coinbaseAPI
        .getAccessToken(code)
        .then(async (cbRes) => {
          if (cbRes.error) {
            Errors.General.logError(cbRes.error);
            return res.json(cbRes.error);
          }

          const accessTokenData = cbRes.data;
          const currentDate = new Date();

          currentDate.setSeconds(accessTokenData.expires_in);
          accessTokenData.expires_in = currentDate.getTime();

          const cbAccountData = await coinbaseAPI.getAccountData(
            accessTokenData.access_token,
          );
          const cbBitcoinWalletData = await coinbaseAPI.createNewWalletAddress(
            accessTokenData.access_token,
            cbAccountData.accountID,
            'bitcoin',
          );
          const newPaymentAccount = await dbModels.PaymentAccount.create({
            user_id: userID,
            profile_id: profileID,
            coinbase_account_id: cbAccountData.accountID,
            coinbase_bitcoin_address: cbBitcoinWalletData.bitcoinAddress,
            coinbase_access_token: accessTokenData.access_token,
            coinbase_access_token_expiry: accessTokenData.expires_in,
            coinbase_refresh_token: accessTokenData.refresh_token,
          });
          console.log('New Payment Account created!', newPaymentAccount.id);
          return res.json({ error: null, success: true });
        })
        .catch((error) => {
          console.log('coinbaseAPI.getAccessToken() error:', error);
          return Errors.General.serveResponse(error, res);
        });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
  /**
   * (TODO): Updates a given user's persisted payment account.
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
      return Errors.General.serveResponse(error, res);
    }
  },
  /**
   * (TODO): Deletes a persisted payment account for a given user
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
      return Errors.General.serveResponse(error, res);
    }
  },
};
