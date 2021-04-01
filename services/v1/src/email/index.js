const templates = require('./templates');
const config = require('../config');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(config.SENDGRID.API_KEY);

module.exports = {
  sendActivateAccountEmail(user) {
    const { subject, html } = templates['activateAccount'](user);
    return sgMail.send({
      subject,
      html,
      to: user.email,
      from: config.SENDGRID.supportEmail,
      attachments: [],
    });
  },
  sendResetPasswordEmail(user) {
    const { subject, html } = templates['resetPassword'](user);
    return sgMail.send({
      subject,
      html,
      to: user.email,
      from: config.SENDGRID.supportEmail,
      attachments: [],
    });
  },
  sendTokenConversionStatusEmail(emailMetaData) {
    const { subject, html } = templates['tokenConversionStatus'](emailMetaData);
    return sgMail.send({
      subject,
      html,
      to: emailMetaData.email,
      from: config.SENDGRID.supportEmail,
      attachments: [],
    });
  },
};
