/**
 * Request Validation module for Session endpoints.
 * @module src/controllers/middleware/Session/validation.js
 */
const Joi = require('joi');
const { Errors, Tokens } = require('../../../utils');

module.exports = {
  tokenHasExpired(authorization, cb) {
    const tRes = Tokens.extractJWTFromHeaders(authorization);
    if (tRes.error) {
      Errors.General.logError(tRes.error);
      return cb({ error: tRes.error });
    }
    Tokens.verifyToken(tRes.token, (rsp) => cb(rsp));
  },
  signUpLogInBodySchema: Joi.object({
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'org', 'edu'] },
    }),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{10,30}$')),
  }).with('email', 'password'),
};
