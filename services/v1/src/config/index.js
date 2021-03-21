/**
 * General Configuration module.
 * @module src/config/index.js
 */
module.exports = {
  API_KEY: process.env.API_KEY || 'API_KEY',
  AWS: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAJFFJCL3B2QQR2MPQ',
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY ||
      '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',
    region: process.env.AWS_REGION || 'us-west-1',
    S3: {
      bucket: process.env.AWS_BUCKET || 'epay-bucket-dev',
      bucketPIFolder: process.env.AWS_BUCKET_PI_FOLDER || 'profileImages',
    },
  },
  // TODO: Setup CB Notification Webhooks on Coinbase Dev App
  COINBASE: {
    API_KEY: process.env.COINBASE_CLIENT_ID || 'CB_API_KEY',
    API_SECRET_KEY: process.env.COINBASE_CLIENT_SECRET || 'CB_API_SECRET_KEY',
    AUTHCODE_REDIRECT_URI:
      process.env.COINBASE_AUTHCODE_REDIRECT_URI ||
      'http://localhost:7777/api/v1/payment/accounts/create/oauthcallback/code',
    SCOPES: [
      'wallet:accounts:read',
      'wallet:accounts:update',
      'wallet:addresses:read',
      'wallet:addresses:create',
      'wallet:buys:read',
      'wallet:buys:create',
      'wallet:deposits:read',
      'wallet:payment-methods:read',
      'wallet:payment-methods:limits',
      // 'wallet:transactions:send', // **
      'wallet:transactions:request', //**
      'wallet:transactions:transfer', //**
      'wallet:user:read',
      'wallet:user:email',
      'wallet:withdrawals:read', // **
      'wallet:withdrawals:create', //**
    ],
  },
  JWT: {
    algorithm: process.env.JWT_ALGORITHM || 'RS256',
    audience: process.env.JWT_AUDIENCE || 'urn:localhost',
    issuer: process.env.JWT_ISSUER || 'urn:local_service',
    secret: process.env.JWT_SECRET || 'secret',
    expiration: process.env.JWT_EXPIRATION || '30m',
    expirationInSecs: 30 * 60 * 1000, // 30 minutes
  },
  PORT: process.env.PORT || 7777,
  SERVICE_NAME: 'API (V1)',
  PASSWORDS: {
    resetExpiry: 5 * 60 * 1000, // 5 minutes
  },
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
