/**
 * Module for exporting utility methods related to application errors.
 * @module src/utils/errors/index.js
 */
module.exports = {
  General: {
    logError(error) {
      console.log('ERROR:', error);
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
