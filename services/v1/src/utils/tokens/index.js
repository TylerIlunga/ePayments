/**
 * Module for exporting utility methods related to JWTs.
 * @module src/utils/tokens/index.js
 */
const jwt = require('jsonwebtoken');
const Errors = require('../errors');
const { JWT } = require('../../config');

module.exports = {
  signToken(data) {
    return jwt.sign({ data }, JWT.secret, {
      expiresIn: JWT.expiration,
    });
  },
  verifyToken(token, cb) {
    jwt.verify(token, JWT.secret, null, (error, decoded) => {
      if (error) {
        Errors.General.logError(error);
        return cb({ error: error.message });
      }
      return cb(decoded);
    });
  },
};
