/**
 * Module for exporting utility methods related to JWTs.
 * @module src/utils/tokens/index.js
 */
const jwt = require('jsonwebtoken');
const Errors = require('../errors');
const { JWT } = require('../../config');

module.exports = {
  extractJWTFromHeaders(authorization) {
    if (!authorization) {
      return { error: Errors.Network.invalidRequest() };
    }
    authorization = authorization.split('Bearer ');
    // console.log('authorization', authorization);
    if (authorization.length === 1) {
      return { error: Errors.Network.invalidRequest() };
    }
    const token = authorization[1];
    // console.log('Token:::', token);
    return { token };
  },
  signToken(data) {
    console.log('Tokens.signToken()');
    return jwt.sign({ data }, JWT.secret, {
      expiresIn: JWT.expiration,
    });
  },
  verifyToken(token, cb) {
    console.log('verifyToken()');
    jwt.verify(token, JWT.secret, null, (error, decoded) => {
      if (error) {
        Errors.General.logError(error);
        return cb({ error: error.message });
      }
      console.log('Token decoded:::', decoded);
      return cb(decoded);
    });
  },
};
