/**
 * Module for exporting utility methods related to application errors.
 * @module src/utils/errors/index.js
 */
const logError = (error) => {
  console.error('ERROR:', error);
};

module.exports = {
  General: {
    logError,
    serveResponse(res) {
      logError(error);
      return res.json(error);
    },
  },
  Network: {
    invalidRequest() {
      return 'Invalid Request';
    },
    missingApiKey() {
      return 'API key is missing';
    },
    sessionExists() {
      return 'Session exists';
    },
    sessionDoesNotExist() {
      return 'Session does not exist';
    },
    standardValidationFailure() {
      return 'Standard Validation received invalid payloads.';
    },
  },
};
