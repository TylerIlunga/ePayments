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
    apiError(service, error) {
      return `Error from "${service}" web service: ` + error;
    },
    invalidMessage() {
      return 'Invalid Message';
    },
    invalidRequest() {
      return 'Invalid Request';
    },
    missingApiKey() {
      return 'API key is missing';
    },
    invalidRecords() {
      return 'Invalid record(s)';
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
