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

  getHeaders() {
    return { Authorization: `Bearer ${this.userAccessToken}` };
  }

  request(reqOptions) {
    return new Promise((resolve, reject) => {
      axios({
        method: reqOptions.method,
        baseURL: reqOptions.baseURL,
        url: reqOptions.path,
        headers: this.getHeaders(),
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

  refreshAccessToken(refreshToken) {
    return this.request({
      method: 'POST',
      baseURL: this.oauth_url,
      path: 'token',
      queryParams: {
        grant_type: 'refresh_token',
        client_id: coinbaseConfig.API_KEY,
        client_secret: coinbaseConfig.API_SECRET_KEY,
        refresh_token: refreshToken,
      },
    });
  }
}

module.exports = CoinbaseAPIHelper;
