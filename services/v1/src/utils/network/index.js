/**
 * Module for exporting utility methods related to network activities.
 * @module src/utils/network/index.js
 */
const axios = require('axios');
const rax = require('retry-axios');
const Errors = require('../errors');
const MobileDetect = require('mobile-detect');

module.exports = {
  requestIsFromMobileDevice(req) {
    const userAgent = req.headers['user-agent'];
    return userAgent ? new MobileDetect(userAgent).mobile() : null;
  },
  request({ method, url, headers, body, timeout, meta }) {
    return axios({
      method,
      url,
      headers,
      timeout,
      data: body,
      raxConfig: {
        retry: 3,
        noResponseRetries: 2,
        retryDelay: 100, // ms
        httpMethodsToRetry: ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT', 'POST'],
        statusCodesToRetry: [
          [100, 199],
          [429, 429],
          [500, 599],
        ], // Default
        backoffType: 'exponential', // Default
        onRetryAttempt: (err) => {
          const cfg = rax.getConfig(err);
          console.log(
            `Retrying network request: Attempt #${cfg.currentRetryAttempt}`,
          );
        },
      },
    })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        Errors.General.logError(error);
        return { error };
      });
  },
};
