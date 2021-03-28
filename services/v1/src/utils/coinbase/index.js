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
      },
    };
    let url = `${opts.baseURL}/${opts.path}?response_type=${opts.queryParams.responseType}&client_id=${opts.queryParams.clientID}&redirect_uri=${opts.queryParams.redirectURI}&state=${state}&scope=${opts.queryParams.scopes}`;
    return res.redirect(url);
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
          reject(error);
        });
    });
  }

  getWalletAddress(accessToken, accountID, currencyType) {
    // https://api.coinbase.com/v2/accounts/:account_id/addresses
    return new Promise((resolve, reject) => {
      this.request({
        method: 'GET',
        baseURL: this.api_url,
        path: `/accounts/:${accountID}/addresses`,
        headers: this.getHeaders({
          Authorization: `Bearer ${accessToken}`,
        }),
        queryParams: {},
      })
        .then((res) => {
          const wallets = res.data.data;
          console.log('getWalletAddress() wallets:', wallets);
          const walletData = {};
          for (let i = 0; i < wallets.length; i++) {
            if (
              wallets[i].network == currencyType &&
              wallets[i].resource == 'address'
            ) {
              walletData['bitcoinAddress'] = wallets[i].address;
              break;
            }
          }
          console.log(
            'getWalletAddress() walletData[bitcoinAddress]:',
            walletData['bitcoinAddress'],
          );
          resolve(walletData);
        })
        .catch((error) => {
          console.log('getWalletAddress() error:', error);
          reject(error);
        });
    });
  }

  getAccountData(accessToken) {
    return new Promise((resolve, reject) => {
      this.request({
        method: 'POST',
        baseURL: this.api_url,
        path: '/accounts',
        headers: this.getHeaders({
          Authorization: `Bearer ${accessToken}`,
        }),
        queryParams: {},
      })
        .then((res) => {
          const accounts = res.data.data;
          console.log('getAccountData() accounts:', accounts);
          const accountData = {};
          for (let i = 0; i < accounts.length; i++) {
            if (
              accounts[i].type == 'wallet' &&
              accounts[i].currency.toLowerCase() == 'btc'
            ) {
              accountData['accountID'] = accounts[i].id;
              break;
            }
          }
          console.log(
            'getAccountData() accountData[accountID]:',
            accountData['accountID'],
          );
          resolve(accountData);
        })
        .catch((error) => {
          console.log('getAccountData() error:', error);
          reject(error);
        });
    });
  }

  transferFunds(transactionData) {
    return new Promise((resolve, reject) => {
      // Use CB Transaction API methods...
      // Account for lack of funds
      this.request({
        method: 'POST',
        baseURL: this.api_url,
        path: `/accounts/${transactionData.from.coinbase_account_id}/transactions`,
        headers: this.getHeaders({
          Authorization: `Bearer ${transactionData.from.coinbase_access_token}`,
        }),
        queryParams: {
          type: 'send',
          to: transactionData.to.coinbase_bitcoin_address,
          amount: transactionData.price,
          currency: transactionData.currency,
        },
      });
    });
  }

  convertToFiat(account, transactionID) {
    return new Promise((resolve, reject) => {
      // Use CB Withdrawl API methods...
    });
  }
}

module.exports = CoinbaseAPIHelper;
