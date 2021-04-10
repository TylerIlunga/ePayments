/**
 * BusinessTransaction Controller module.
 * @module src/controllers/BusinessTransaction/index.js
 */
const uuid = require('uuid');
const generalConfig = require('../../config');
const EmailSender = require('../../email');
const {
  getSqlizeModule,
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
} = require('../../middleware/BusinessTransaction/validation');
const Op = getSqlizeModule().Op;

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
        productCategory,
        quantity,
        currency,
      } = validationResult.value;

      // TODO: FOR TESTING...REMOVE
      const nbt = await BusinessTransaction.create({
        id: uuid.v4(),
        business_id: businessID,
        customer_id: customerID,
        product_id: productID,
        coinbase_transaction_id: 'cbTransactionResult.id',
        product_category: productCategory,
        quantity: quantity,
        amount: 1.5 * quantity,
        token_amount: '${cbTransactionResult.amount.amount}',
        currency: currency,
        latitude: 0.0,
        longitude: 0.0,
      });

      return res.json({ success: true });

      // Validate Business Account
      const businessAccount = await User.findOne({ where: { id: businessID } });
      if (businessAccount == null) {
        throw { error: 'Business account does not exist for the given ID' };
      }
      const businessProfile = await BusinessProfile.findOne({
        where: { user_id: businessAccount.id },
      });
      if (businessProfile == null) {
        throw { error: 'Business profile does not exist for the given ID' };
      }

      // Validate Customer Account
      const customerAccount = await User.findOne({ where: { id: customerID } });
      if (customerAccount == null) {
        throw { error: 'Customer account does not exist for the given ID' };
      }
      const customerProfile = await CustomerProfile.findOne({
        where: { user_id: customerAccount.id },
      });
      if (customerProfile == null) {
        throw { error: 'Customer profile does not exist for the given ID' };
      }

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

      // Account for expired access tokens (refresh with refresh token and then fetch/persist new accessToken data)
      const coinbaseAPIHelper = new CoinbaseAPIHelper();
      const currentDateTime = new Date();
      const businessAccessTokenExpiryDate = new Date(
        Number(businessPaymentAccount.coinbase_access_token_expiry),
      );
      const customerAccessTokenExpiryDate = new Date(
        Number(customerPaymentAccount.coinbase_access_token_expiry),
      );
      if (businessAccessTokenExpiryDate - currentDateTime <= 0) {
        // Refresh Token + Persist Token
        await coinbaseAPIHelper.refreshAccessToken(
          businessPaymentAccount,
          businessPaymentAccount.coinbase_refresh_token,
        );
      }
      if (customerAccessTokenExpiryDate - currentDateTime <= 0) {
        // Refresh Token + Persist Token
        await coinbaseAPIHelper.refreshAccessToken(
          customerPaymentAccount,
          customerPaymentAccount.coinbase_refresh_token,
        );
      }

      // Convert Product Price to current currency buy price
      const cbCurrentBTCBuyPrice = await coinbaseAPIHelper.getCurrentBuyPriceFor(
        businessPaymentAccount.coinbase_access_token,
        'BTC-USD',
      );

      const businessProductTokenPrice =
        (businessProduct.price * quantity) / cbCurrentBTCBuyPrice.amount;
      if (
        businessProductTokenPrice <=
        generalConfig.COINBASE.currentTransferMinimum
      ) {
        throw {
          error: `BTC Price (${businessProductTokenPrice}) of product must be at least 0.0001 BTC (Coinbase Standard)`,
        };
      }

      // Transfer Product's value from Customer's Coinbase Wallet to Business Wallet (via API map to current currency's wallet)
      const cbTransactionResult = await coinbaseAPIHelper.transferFunds({
        currency,
        twoFactorAuthToken: validationResult.value.twoFactorAuthToken,
        tokenPrice: String(businessProductTokenPrice),
        from: customerPaymentAccount,
        to: businessPaymentAccount,
      });
      console.log(
        'Successfully transfered funds from customer BTC address to business BTC address',
      );

      // Persist BusinessTransaction data
      const businessTransactionData = {
        id: uuid.v4(),
        business_id: businessID,
        customer_id: customerID,
        product_id: productID,
        coinbase_transaction_id: cbTransactionResult.id,
        product_category: productCategory,
        quantity: quantity,
        amount: businessProduct.price * quantity,
        token_amount: `${cbTransactionResult.amount.amount}`,
        currency: currency,
      };
      if (
        validationResult.value.latitude !== undefined &&
        validationResult.value.longitude !== undefined
      ) {
        businessTransactionData.latitude = validationResult.value.latitude;
        businessTransactionData.longitude = validationResult.value.longitude;
      }

      const newBusinessTransaction = await BusinessTransaction.create(
        businessTransactionData,
      );
      console.log('Persisted new transaction data:', newBusinessTransaction.id);

      // Async Response to Customer
      res.json({
        error: false,
        success: true,
        transactionID: newBusinessTransaction.id,
      });

      // Update BusinessProduct details (lower inventory count, increase purchased count)
      businessProduct.inventory_count -= 1;
      businessProduct.purchased_count += 1;
      await businessProduct.save();

      // Convert Crypto value to Fiat Value for Business if
      // they have auto_convert_to_fiat enabled for their payment account.
      // NOTE: Would probably handle this with a dedicated Conversion service in a distributed system...
      if (!businessPaymentAccount.auto_convert_to_fiat) {
        return;
      }
      coinbaseAPIHelper
        .convertToFiat({
          paymentAccount: businessPaymentAccount,
          amount: String(businessProductTokenPrice),
          currency: cbTransactionResult.amount.currency,
        })
        .then(async (cbConversionResult) => {
          console.log('cbConversionResult:', cbConversionResult);
          console.log(
            'coinbaseAPIHelper.convertToFiat(): coinbase ID',
            cbConversionResult.id,
          );
          // Notification email to the business regarding the result of the conversion
          // NOTE: Would probably handle this with a dedicated Email Service in a distributed system...
          EmailSender.sendTokenConversionStatusEmail({
            email: businessProfile.public_email,
            status: 'success',
            conversionData: cbConversionResult,
          })
            .then((eRes) => {
              console.log(
                'Successfully sent out Token Conversion Status (Success) Email',
                eRes,
              );
            })
            .catch((eResError) => {
              console.log(
                'Error sending out Token Conversion Status (Success) Email',
                eResError,
              );
            });
        })
        .catch(async (error) => {
          console.log('coinbaseAPIHelper.convertToFiat() error:', error);
          Errors.General.logError(error);
          // Notification email to the business regarding the result of the conversion
          EmailSender.sendTokenConversionStatusEmail({
            email: businessProfile.public_email,
            status: 'failure',
            conversionData: null,
          })
            .then((eRes) => {
              console.log(
                'Successfully sent out Token Conversion Status (Failure) Email',
                eRes,
              );
            })
            .catch((eResError) => {
              console.log(
                'Error sending out Token Conversion Status (Failure) Email',
                eResError,
              );
            });
        });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
  async listBusinessTransactions(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      listBusinessTransactionsSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    if (
      validationResult.value.businessID === undefined &&
      validationResult.value.customerID === undefined
    ) {
      return res.json({ error: 'Missing business ID or customer ID' });
    }
    try {
      const { queryAttributes } = validationResult.value;
      // List Transactions from our Database based on query attributes
      const sqlAttributes = {
        where: {},
        order: [['created_at', 'ASC']],
      };
      // Given a BusinessID or a CustomerID?
      if (validationResult.value.businessID === undefined) {
        sqlAttributes.where.customer_id = validationResult.value.customerID;
      } else {
        sqlAttributes.where.business_id = validationResult.value.businessID;
      }

      // Given a range of dates?
      if (validationResult.value.betweenDates !== undefined) {
        const { betweenDates } = validationResult.value;
        sqlAttributes.where.created_at = {
          [Op.between]: [betweenDates.start, betweenDates.end],
        };
      }

      const attributes = Object.keys(queryAttributes);
      for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        if (attribute === 'offset' || attribute === 'limit') {
          sqlAttributes[attribute] = queryAttributes[attribute];
          continue;
        }
        if (attribute === 'order') {
          sqlAttributes.order[0][1] = queryAttributes[attribute];
          continue;
        }
        if (typeof attribute === 'string') {
          if (attribute.includes('ID')) {
            const table = attribute.split('ID')[0];
            sqlAttributes.where[`${table}_id`] = queryAttributes[attribute];
          } else {
            sqlAttributes.where[Op.like] = queryAttributes[attribute];
          }
        }
        if (typeof attribute === 'number') {
          if (attribute.includes('ID')) {
            const table = attribute.split('ID')[0];
            sqlAttributes.where[`${table}_id`] = queryAttributes[attribute];
          } else {
            sqlAttributes.where[Op.contains] = queryAttributes[attribute];
          }
        }
      }

      const businessTransactions = await BusinessTransaction.findAll(
        sqlAttributes,
      );

      // Respond to Client Request
      return res.json({ businessTransactions, error: null, success: true });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
  async fetchBusinessTransaction(req, res) {
    // Validate Input
    const validationResult = Validation.validateRequestBody(
      fetchBusinessTransactionSchema,
      req.body,
    );
    if (validationResult.error) {
      return res.json({ error: validationResult.error });
    }
    try {
      const {
        transactionID,
        coinbaseTransactionID,
        businessID,
        customerID,
        productID,
      } = validationResult.value;
      // Fetch Transaction from our Database
      const businessTransaction = await BusinessTransaction.findOne({
        where: {
          id: transactionID,
          coinbase_transaction_id: coinbaseTransactionID,
          business_id: businessID,
          customer_id: customerID,
          product_id: productID,
        },
      });
      if (businessTransaction === null) {
        throw { error: 'Transaction does not exist for the given information' };
      }

      // Respond to Client Request
      return res.json({ businessTransaction, error: null, success: true });
    } catch (error) {
      return Errors.General.serveResponse(error, res);
    }
  },
};
