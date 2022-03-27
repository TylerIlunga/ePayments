/**
 * General Configuration module.
 * @module src/config/index.js
 */
module.exports = {
  API_KEY: process.env.API_KEY,
  AWS: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  },
  COINBASE: {
    API_KEY: process.env.COINBASE_CLIENT_ID,
    API_SECRET_KEY: process.env.COINBASE_CLIENT_SECRET,
    AUTHCODE_REDIRECT_URI:
      process.env.COINBASE_AUTHCODE_REDIRECT_URI ||
      'http://localhost:7777/api/v1/payment/accounts/create/oauthcallback/code',
    SCOPES: [
      'wallet:accounts:read',
      'wallet:addresses:read',
      'wallet:addresses:create',
      'wallet:buys:read',
      'wallet:buys:create',
      'wallet:deposits:read',
      'wallet:transactions:send',
      'wallet:transactions:transfer',
      'wallet:sells:create',
      'wallet:user:read',
      'wallet:user:email',
    ],
    currentTransferMinimum: 0.0001,
    currentTransactionSendLimitAmount: 1,
    currentTransactionSendLimitCurrency: 'USD',
    currentTransactionSendLimitPeriod: 'day',
  },
  JWT: {
    algorithm: process.env.JWT_ALGORITHM || 'RS256',
    audience: process.env.JWT_AUDIENCE || 'urn:localhost',
    issuer: process.env.JWT_ISSUER || 'urn:local_service',
    secret: process.env.JWT_SECRET || 'secret',
    expiration: process.env.JWT_EXPIRATION || '59m',
    expirationInSecs: 59 * 60 * 1000, // 59 minutes
  },
  PORT: process.env.PORT || 7777,
  SERVICE_NAME: 'API (V1)',
  PASSWORDS: {
    resetExpiry: 5 * 60 * 1000, // 5 minutes
  },
  RECAPTCHA: {
    secretkey: process.env.RECAPTCHA_SECRET,
    submitUrl(secretkey, recaptchaToken, ip) {
      return `https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${recaptchaToken}&remoteip=${ip}`;
    },
  },
  SENDGRID: {
    API_KEY: process.env.SENDGRID_API_KEY,
    supportEmail: process.env.SUPPORT_EMAIL_ADDRESS,
    teamEmail: process.env.TEAM_EMAIL_ADDRESS,
  },
  VALIDATION: {
    genericPasswordPattern: new RegExp('^[a-zA-Z0-9]{10,30}$'),
  },
};
