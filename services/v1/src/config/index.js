/**
 * General Configuration module.
 * @module src/config/index.js
 */
module.exports = {
  API_KEY: process.env.API_KEY || 'API_KEY',
  JWT: {
    algorithm: process.env.JWT_ALGORITHM || 'RS256',
    audience: process.env.JWT_AUDIENCE || 'urn:localhost',
    issuer: process.env.JWT_ISSUER || 'urn:local_service',
    secret: process.env.JWT_SECRET || 'secret',
    expiration: process.env.JWT_EXPIRATION || '30m',
  },
  PORT: process.env.PORT || 7777,
  SERVICE_NAME: 'API (V1)',
  RECAPTCHA: {
    secretkey:
      process.env.RECAPTCHA_SECRET ||
      '6LezEsEUAAAAACL7Zk4UPGB7v4Vlt9OMWtHGUGlV',
    submitUrl(secretkey, recaptchaToken, ip) {
      return `https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${recaptchaToken}&remoteip=${ip}`;
    },
  },
  SENDGRID: {
    API_KEY:
      process.env.SENDGRID_API_KEY ||
      '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',
    supportEmail: process.env.SUPPORT_EMAIL_ADDRESS || 'support@mizudev.com',
  },
};
