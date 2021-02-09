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
    return jwt.sign({ data }, JWT.secret, {
      expiresIn: JWT.expiration,
      issuer: JWT.issuer,
      audience: JWT.audience,
    });
  },
  verifyToken(token, cb) {
    jwt.verify(
      token,
      JWT.secret,
      { audience: JWT.audience, issuer: JWT.issuer },
      (error, decoded) => {
        if (error) {
          Errors.General.logError(error);
          return cb({ session: false });
        }
        console.log('Token decoded:::', decoded);
        return cb({
          session: decoded ? true : false,
          user: decoded.data,
        });
      },
    );
  },
};
