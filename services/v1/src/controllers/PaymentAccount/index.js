/**
 * Controller module for PaymentAccount endpoints.
 * @module src/controllers/PaymentAccount/index.js
 */
const { broadcastChannel } = require('./config');
const dbConfig = require('../../dal/config');
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
  toggleAutoConvertToFiatFeatureSchema,
} = require('../../middleware/PaymentAccount/validation');

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
      const { id, userID, profileID } = validationResult.value;
      const paymentAccount = await dbConfig.PaymentAccount.findOne({
        where: { id, user_id: userID, profile_id: profileID },
      });
      if (paymentAccount === null) {
        throw { error: 'Payment account does not exist for the given data.' };
      }
      return res.json({ error: null, success: true, paymentAccount });
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
    let transaction = null;
    try {
      const { code, state } = req.query;
      const { email, userID, profileID, replaceAccount } = JSON.parse(state);
      // Validate userID + profileID from state
      const user = await dbConfig.User.findOne({
        where: { email, id: userID },
      });
      if (user == null) {
        throw { error: 'Account does not exist for the given user ID' };
      }
      const profileType = `${Strings.capitalize(user.type)}Profile`;
      console.log('user profile type:', profileType);
      const userProfile = await dbConfig[profileType].findOne({
        where: { id: profileID, user_id: user.id },
      });
      if (userProfile == null) {
        throw { error: 'Profile does not exist for the given IDs' };
      }

      // Persist Coinbase Access Token Data
      const coinbaseAPI = new CoinbaseAPIHelper();
      const cbRes = await coinbaseAPI.getAccessToken(code);
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
      if (replaceAccount) {
        transaction = await dbConfig.getConnection().transaction();
        await dbConfig.PaymentAccount.destroy({
          where: { transaction, user_id: userID, profile_id: profileID },
        });
      }
      const newPaymentAccount = await dbConfig.PaymentAccount.create(
        {
          user_id: userID,
          profile_id: profileID,
          coinbase_account_id: cbAccountData.accountID,
          coinbase_bitcoin_address: cbBitcoinWalletData.bitcoinAddress,
          coinbase_access_token: accessTokenData.access_token,
          coinbase_access_token_expiry: accessTokenData.expires_in,
          coinbase_refresh_token: accessTokenData.refresh_token,
        },
        { transaction },
      );
      console.log('New Payment Account created!', newPaymentAccount.id);
      return res.send(
        broadcastChannel({
          error: null,
          success: true,
          paymentAccount: {
            id: newPaymentAccount.id,
            user_id: newPaymentAccount.user_id,
            profile_id: newPaymentAccount.profile_id,
            coinbase_account_id: newPaymentAccount.coinbase_account_id,
            coinbase_bitcoin_address:
              newPaymentAccount.coinbase_bitcoin_address,
          },
        }),
      );
    } catch (error) {
      if (transaction !== null) {
        await transaction.rollback();
      }
      return Errors.General.serveResponse(error, res);
    }
  },
  /**
   * Toggles the status of the "Auto Convert Tokens to Fiat Currency" feature for Businesses
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async toggleAutoConvertToFiatFeature(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      toggleAutoConvertToFiatFeatureSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const {
        id,
        userID,
        profileID,
        autoConvertToFiatStatus,
      } = validationResult.value;
      const paymentAccount = await dbConfig.PaymentAccount.findOne({
        where: { id, user_id: userID, profile_id: profileID },
      });
      if (paymentAccount === null) {
        throw { error: 'Payment account does not exist for the given data.' };
      }

      paymentAccount.auto_convert_to_fiat = autoConvertToFiatStatus;
      await paymentAccount.save();

      return res.json({ error: null, success: true });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
};
