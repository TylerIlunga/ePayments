/**
 * Module for the Coinbase API utility class.
 * @module src/utils/coinbase/index.js
 */
const axios = require('axios');
const coinbaseConfig = require('../../config').COINBASE;
const crypto = require('crypto');

class CoinbaseAPIHelper {
  constructor(userAccessToken = '') {
    this.userAccessToken = userAccessToken;
    this.apiKey = coinbaseConfig.API_KEY;
    this.apiSecretKey = coinbaseConfig.API_SECRET_KEY;
    this.authcode_redirectURI = coinbaseConfig.AUTHCODE_REDIRECT_URI;
    this.oauth_url = 'https://www.coinbase.com/oauth';
    this.api_url = 'https://api.coinbase.com/v2';
    this.tokenSymbolToName = {
      btc: 'bitcoin',
      eth: 'ethereum',
      ltc: 'litecoin',
    };

    this.authorizeUser = this.authorizeUser.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
  }

  generateMessageSignature(secret) {
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  getHeaders(opts = {}) {
    const headers = { ...opts };
    return headers;
  }

  request(reqOptions) {
    return new Promise((resolve, reject) => {
      axios({
        method: reqOptions.method,
        baseURL: reqOptions.baseURL,
        url: reqOptions.path,
        headers: reqOptions.headers,
        params: reqOptions.queryParams,
        data: reqOptions.body,
      })
        .then((res) => {
          // console.log('request() then:', res);
          resolve(res);
        })
        .catch((error) => {
          console.log('request() error:', error);
          reject(error);
        });
    });
  }

  authorizeUser(res, state = '') {
    console.log('CoinbaseAPIHelper.authorizeUser():', state);
    const opts = {
      baseURL: this.oauth_url,
      path: 'authorize',
      queryParams: {
        state,
        responseType: 'code',
        clientID: coinbaseConfig.API_KEY,
        redirectURI: this.authcode_redirectURI,
        scopes: coinbaseConfig.SCOPES.toString(),
        sendLimitAmount: coinbaseConfig.currentTransactionSendLimitAmount,
        sendLimitCurrency: coinbaseConfig.currentTransactionSendLimitCurrency,
        sendLimitPeriod: coinbaseConfig.currentTransactionSendLimitPeriod,
      },
    };
    return res.json({
      authURL: `${opts.baseURL}/${opts.path}?response_type=${opts.queryParams.responseType}&client_id=${opts.queryParams.clientID}&redirect_uri=${opts.queryParams.redirectURI}&state=${state}&scope=${opts.queryParams.scopes}&meta[send_limit_amount]=${opts.queryParams.sendLimitAmount}&meta[send_limit_currency]=${opts.queryParams.sendLimitCurrency}&meta[send_limit_period]=${opts.queryParams.sendLimitPeriod}`,
    });
  }

  getAccessToken(oauthCallbackCode) {
    return this.request({
      method: 'POST',
      baseURL: this.oauth_url,
      path: 'token',
      headers: this.getHeaders({}),
      queryParams: {
        grant_type: 'authorization_code',
        code: oauthCallbackCode,
        client_id: coinbaseConfig.API_KEY,
        client_secret: coinbaseConfig.API_SECRET_KEY,
        redirect_uri: this.authcode_redirectURI,
        scopes: coinbaseConfig.SCOPES.toString(),
      },
    });
  }

  refreshAccessToken(currentPaymentAccount, refreshToken) {
    return new Promise((resolve, reject) => {
      console.log('refreshAccessToken()');
      this.request({
        method: 'POST',
        baseURL: this.oauth_url,
        path: 'token',
        headers: this.getHeaders({}),
        queryParams: {
          grant_type: 'refresh_token',
          client_id: coinbaseConfig.API_KEY,
          client_secret: coinbaseConfig.API_SECRET_KEY,
          refresh_token: refreshToken,
        },
      })
        .then((response) => {
          const newAccessTokenData = response.data;

          currentPaymentAccount.coinbase_access_token =
            newAccessTokenData.access_token;
          currentPaymentAccount.coinbase_refresh_token =
            newAccessTokenData.refresh_token;

          const currentTimeAtPersistence = new Date();

          currentTimeAtPersistence.setSeconds(newAccessTokenData.expires_in);
          currentPaymentAccount.coinbase_access_token_expiry = currentTimeAtPersistence.getTime();

          console.log(
            'refreshAccessToken(): coinbase_access_token_expiry',
            currentPaymentAccount.coinbase_access_token_expiry,
          );

          currentPaymentAccount.save();

          resolve();
        })
        .catch((error) => {
          reject(error.response.data);
        });
    });
  }

  createNewWalletAddress(accessToken, accountData) {
    // https://api.coinbase.com/v2/accounts/:account_id/addresses
    const { accountID, tokenSymbol } = accountData;
    return new Promise((resolve, reject) => {
      this.request({
        method: 'POST',
        baseURL: this.api_url,
        path: `/accounts/${accountID}/addresses`,
        headers: this.getHeaders({
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }),
        body: {
          name: `ePayments bitcoin receive address`,
        },
      })
        .then((res) => {
          const newAddressData = res.data.data;
          console.log(
            'createNewWalletAddress() newAddressData:',
            newAddressData,
          );

          resolve({
            token: this.tokenSymbolToName[tokenSymbol],
            address: newAddressData.address,
          });
        })
        .catch((error) => {
          console.log('createNewWalletAddress() error:', error);
          reject(error.response.data);
        });
    });
  }

  getAccountData(accessToken) {
    return new Promise((resolve, reject) => {
      this.request({
        method: 'GET',
        baseURL: this.api_url,
        path: '/accounts',
        headers: this.getHeaders({
          Authorization: `Bearer ${accessToken}`,
        }),
      })
        .then((res) => {
          const accounts = res.data.data;
          console.log('getAccountData() accounts:', accounts);
          const accountData = {};
          for (let i = 0; i < accounts.length; i++) {
            console.log('account currency:', accounts[i].currency);
            const tokenSymbol = accounts[i].currency.toLowerCase();
            if (
              accounts[i].type == 'wallet' &&
              (tokenSymbol == 'btc' ||
                tokenSymbol == 'eth' ||
                tokenSymbol == 'ltc')
            ) {
              accountData['accountID'] = accounts[i].id;
              accountData['tokenSymbol'] = tokenSymbol;
              break;
            }
          }
          console.log('getAccountData() accountData:', accountData);
          if (!accountData['accountID']) {
            // NOTE: Why the fuck does CB only let you choose one right now...
            return reject({
              error:
                'Please choose BTC (Bitcoin), ETH (Ethereum), or LTC (LTC)',
            });
          }
          resolve(accountData);
        })
        .catch((error) => {
          console.log('getAccountData() error:', error);
          reject(error.response.data);
        });
    });
  }

  getCurrentBuyPriceFor(accessToken, currencyPair) {
    return new Promise((resolve, reject) => {
      this.request({
        method: 'GET',
        baseURL: this.api_url,
        path: `/prices/${currencyPair}/buy`,
        headers: this.getHeaders({
          Authorization: `Bearer ${accessToken}`,
        }),
      })
        .then((res) => {
          console.log('getCurrentBuyPriceFor res.data:', res.data);
          resolve(res.data.data);
        })
        .catch((error) => {
          console.log('getCurrentBuyPriceFor() error:', error);
          reject(error.response.data);
        });
    });
  }

  transferFunds(transactionData) {
    return new Promise(async (resolve, reject) => {
      const reqHeaders = this.getHeaders({
        Authorization: `Bearer ${transactionData.from.coinbase_access_token}`,
        'Content-Type': 'application/json',
      });
      // NOTE: (NOT IN V1) [Requires two seperate requests for type: 'send' requests to CB]
      // Reference: https://developers.coinbase.com/docs/wallet/coinbase-connect/two-factor-authentication
      // if (
      //   transactionData.twoFactorAuthToken !== null &&
      //   transactionData.twoFactorAuthToken !== undefined
      // ) {
      //   reqHeaders['CB-2FA-TOKEN'] = transactionData.twoFactorAuthToken;
      // }
      this.request({
        method: 'POST',
        baseURL: this.api_url,
        path: `/accounts/${transactionData.from.coinbase_account_id}/transactions`,
        headers: reqHeaders,
        body: {
          // NOTE: For external accounts, but in v1 we're addressing only Coinbase wallets (internal)
          // type: 'send',
          type: 'transfer',
          to: transactionData.to.coinbase_bitcoin_address,
          amount: transactionData.tokenPrice,
          currency: transactionData.currency,
        },
      })
        .then((res) => {
          console.log('transferFunds res.data:', res.data);
          resolve(res.data.data);
        })
        .catch((error) => {
          console.log('transferFunds() error:', error);
          if (error.response.status === 402) {
            return reject({ error: 'TFA Token required' });
          }
          reject(error.response.data);
        });
    });
  }

  convertToFiat(conversionData) {
    return new Promise((resolve, reject) => {
      this.request({
        method: 'POST',
        baseURL: this.api_url,
        path: `/accounts/${conversionData.paymentAccount.coinbase_account_id}/sells`,
        headers: this.getHeaders({
          Authorization: `Bearer ${conversionData.paymentAccount.coinbase_access_token}`,
          'Content-Type': 'application/json',
        }),
        body: {
          amount: conversionData.amount,
          currency: conversionData.currency,
        },
      })
        .then((res) => {
          console.log('convertToFiat() res.data:', res.data);
          resolve(res.data.data);
        })
        .catch((error) => {
          console.log('convertToFiat() error:', error);
          reject(error.response.data);
        });
    });
  }
}

module.exports = CoinbaseAPIHelper;
