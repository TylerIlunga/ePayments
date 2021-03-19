// TODO: JSDOC Module Header
const axios = require('axios');
const crypto = require('crypto');

class Coinbase {
  constructor(apiKey = null, apiSecretKey = null) {
    this.apiKey = apiKey;
    this.apiSecretKey = apiSecretKey;
    this.api_url = 'https://api.coinbase.com/v2';
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
      'CB-ACCESS-KEY': this.apiKey,
      'CB-ACCESS-SIGN': this.generateMessageSignature(
        String(ts) + reqMethod + reqPath + reqBodyAsString,
      ),
      'CB-ACCESS-TIMESTAMP': ts,
    };
  }

  request(method = '', path = '', queryParams = {}, body = {}) {
    return axios({
      method,
      baseURL: this.api_url,
      url: path,
      headers: this.getHeaders(method, url, JSON.stringify(body)),
      params: queryParams,
      data: body,
    })
      .then((res) => res)
      .catch((error) => ({ error }));
  }

  authorizeUser() {}
  getAccessToken() {}
}

module.exports = Coinbase;
