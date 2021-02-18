const Joi = require('joi');
const { Errors, Tokens } = require('../../../utils');

const extractErrorMessage = (errorObject) => {
  const { details } = errorObject;
  if (
    details.length === 0 ||
    details[0].message === undefined ||
    details[0].message === null
  ) {
    return null;
  }
  // NOTE: Escape characters included in message;
  return details[0].message;
};

module.exports = {
  extractErrorMessage,
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
