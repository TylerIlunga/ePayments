// TODO: JSDOC Module Header
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

  getHeaders(reqMethod, reqPath, reqBodyAsString) {
    /**
     * ak = access key, ts = timestamp (must be within 30 seconds of the API service time)
     * method = "GET", "POST", "PUT", etc., requestPath = (ex)"/v2/exchange-rates?currency=USD"
     * body = JSON.stringify(requestBody)
     */

    //  res.request.path,
    //  res.request.method,
    const ts = new Date().getTime();
    return {
      Authorization: `Bearer ${this.userAccessToken}`,
      // 'CB-ACCESS-KEY': this.apiKey,
      // 'CB-ACCESS-SIGN': this.generateMessageSignature(
      //   String(ts) + reqMethod + reqPath + reqBodyAsString,
      // ),
      // 'CB-ACCESS-TIMESTAMP': ts,
    };
  }

  request(reqOptions) {
    return axios({
      method: reqOptions.method,
      baseURL: reqOptions.baseURL,
      url: reqOptions.path,
      headers: this.getHeaders(
        reqOptions.method,
        reqOptions.path,
        JSON.stringify(reqOptions.body),
      ),
      params: reqOptions.queryParams,
      data: reqOptions.body,
    })
      .then((res) => {
        console.log('request() then:', res);
        return res;
      })
      .catch((error) => {
        console.log('request() error:', error);
        throw error;
      });
  }

  authorizeUser(res, state = '') {
    // TODO: Handle 'state' query parameter
    // state = this.generateMessageSignature((String(Math.random() * 2)) + new Date().getTime())
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
    let url = `${opts.baseURL}/${opts.path}?response_type=${opts.queryParams.responseType}&client_id=${opts.queryParams.clientID}&redirect_uri=${opts.queryParams.redirectURI}&scope=${opts.queryParams.scopes}`;
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
}

module.exports = CoinbaseAPIHelper;
