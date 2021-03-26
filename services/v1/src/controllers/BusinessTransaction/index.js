/**
 * BusinessProduct Controller module.
 * @module src/controllers/BusinessProduct/index.js
 */
const {
  BusinessProfile,
  BusinessProduct,
  CustomerProfile,
  BusinessTransaction,
  PaymentAccount,
  User,
} = require('../../dal/config');
const { Errors, CoinbaseAPIHelper, Validation } = require('../../utils');
const {
  createBusinessTransactionSchema,
  listBusinessTransactionsSchema,
  fetchBusinessTransactionSchema,
  updateBusinessTransactionSchema,
  deleteBusinessTransactionSchema,
} = require('../middleware/BusinessTransaction/validation');
module.exports = {
  /**
   * Creates/Serves a new Business Transaction.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  async createBusinessTransaction(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      createBusinessTransactionSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const {
        businessID,
        customerID,
        productID,
        sku,
        currency,
        latitude,
        longitude,
      } = validationResult.result;
      // Validate Business Account
      const businessAccount = await User.findOne({ where: { id: businessID } });
      if (businessAccount == null) {
        throw { error: 'Business account does not exist for the given ID' };
      }
      // const businessProfile = await BusinessProfile.findOne({ where: { user_id: businessAccount.id } });
      // if (businessProfile == null) {
      //   throw { error: "Business profile does not exist for the given ID" };
      // }
      // Validate Customer Account
      const customerAccount = await User.findOne({ where: { id: customerID } });
      if (customerAccount == null) {
        throw { error: 'Customer account does not exist for the given ID' };
      }
      // const customerProfile = await CustomerProfile.findOne({ where: { user_id: customerAccount.id } });
      // if (customerProfile == null) {
      //   throw { error: "Customer profile does not exist for the given ID" };
      // }
      // Validate Product
      const businessProduct = await BusinessProduct.findOne({
        where: { sku, id: productID, user_id: businessAccount.id },
      });
      if (businessProduct == null) {
        throw { error: 'Product does not exist for the given info.' };
      }
      // Evaluate PaymentAccount Information for both Accounts
      const businessPaymentAccount = await PaymentAccount.findOne({
        where: { user_id: businessAccount.id },
      });
      if (businessPaymentAccount == null) {
        throw { error: 'Business payment account does not exist.' };
      }
      const customerPaymentAccount = await PaymentAccount.findOne({
        where: { user_id: customerAccount.id },
      });
      if (customerPaymentAccount == null) {
        throw { error: 'Customer payment account does not exist.' };
      }
      // Account for expired access tokens (refresh with refresh token and then fetch/store new accessToken data)
      // Transfer Product's value from Customer's Coinbase Wallet to Business Wallet (via API map to current currency's wallet)
      const coinbaseAPIHelper = new CoinbaseAPIHelper();
      const currentDateTime = new Date();
      const businessAccessTokenExpiryDate = new Date(
        businessPaymentAccount.coinbase_access_token_expiry,
      );
      if (businessAccessTokenExpiryDate - currentDateTime <= 0) {
        // Refresh Token + Persist Token
        const newAccessTokenData = await coinbaseAPIHelper.refreshAccessToken(
          businessPaymentAccount.coinbase_refresh_token,
        );
        businessPaymentAccount.coinbase_access_token =
          newAccessTokenData.access_token;
        businessPaymentAccount.coinbase_refresh_token =
          newAccessTokenData.refresh_token;

        const currentTimeAtPersistence = new Date();

        currentTimeAtPersistence.setSeconds(newAccessTokenData.expires_in);
        businessPaymentAccount.coinbase_access_token_expiry = currentTimeAtPersistence.getTime();

        businessPaymentAccount.save();
      }

      const customerAccessTokenExpiryDate = new Date(
        customerPaymentAccount.coinbase_access_token_expiry,
      );
      if (customerAccessTokenExpiryDate - currentDateTime <= 0) {
        // Refresh Token + Persist Token
        const newAccessTokenData = await coinbaseAPIHelper.refreshAccessToken(
          customerPaymentAccount.coinbase_refresh_token,
        );
        customerPaymentAccount.coinbase_access_token =
          newAccessTokenData.access_token;
        customerPaymentAccount.coinbase_refresh_token =
          newAccessTokenData.refresh_token;

        const currentTimeAtPersistence = new Date();

        currentTimeAtPersistence.setSeconds(newAccessTokenData.expires_in);
        customerPaymentAccount.coinbase_access_token_expiry = currentTimeAtPersistence.getTime();

        customerPaymentAccount.save();
      }
      // TODO: LEFT OFF HERE...TIRED AF
      // Account for lack of funds
      // Convert Crypto value to Fiat Value if Business has auto_convert_to_fiat enabled
      // Respond
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
  async listBusinessTransactions(req, res) {
    // TODO: Handle Pagination (just add pageNumber(offset), pageSize(limit) with bounds)
    res.send('list');
  },
  async fetchBusinessTransaction(req, res) {
    res.send('fetch');
  },
  async updateBusinessTransaction(req, res) {
    // Possible only an internal call via SQL (sensitive data)
    res.send('update');
  },
  async deleteBusinessTransaction(req, res) {
    // Possible only an internal call via SQL (sensitive data)
    res.send('delete');
  },
};
