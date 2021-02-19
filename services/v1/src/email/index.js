const templates = require('./templates');
const config = require('../config');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(config.SENDGRID.API_KEY);

module.exports = {
  async sendActivateAccountEmail(user) {
    const { subject, html } = templates['activateAccount'](user);
    return sgMail.send({
      subject,
      html,
      to: user.email,
      from: config.SENDGRID.supportEmail,
      attachments: [],
    });
  },
  async sendResetPasswordEmail(user) {
    const { subject, html } = templates['resetPassword'](user);
    return sgMail.send({
      subject,
      html,
      to: user.email,
      from: config.SENDGRID.supportEmail,
      attachments: [],
    });
  },
};
