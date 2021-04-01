/**
 * Module for generated Email templates.
 * @module src/email/templates/index.js
 */
module.exports = {
  activateAccount(user) {
    return {
      subject: 'Welcome to ePayments :)',
      html: require('./VerifyAccount')({ user }),
    };
  },
  resetPassword(user) {
    return {
      subject: 'Reset Password',
      html: require('./ResetPassword')({ user }),
    };
  },
  tokenConversionStatus(emailMetaData) {
    return {
      subject: 'Transaction Update: Token Conversion Status',
      html: require('./TokenConversionStatus')(emailMetaData),
    };
  },
};
