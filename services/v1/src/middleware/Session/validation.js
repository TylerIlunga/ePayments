/**
 * Request Validation module for Session endpoints.
 * @module src/middleware/Session/validation.js
 */
const Joi = require('joi');
const { Errors, Tokens } = require('../../utils');
const { VALIDATION } = require('../../config');

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
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net', 'org', 'edu'] },
      })
      .required(),
    password: Joi.string().required(),
  }),
  fetchUserSessionData: Joi.object({
    ut: Joi.string().required(),
  }),
};
