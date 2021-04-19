/**
 * Module for the email(s) generated for verifying accounts.
 * @module src/email/templates/VerifyAccount/index.js
 */
module.exports = ({ user }) => {
  return `
    Welcome to ePayments!
    <br/><br/>
    We are really excited to help you dive deeper into the world of digital finance :)
	  <br/><br/>
    <p><strong>Copy and Paste</strong> this Activation Token: <strong>${user.activation_token}</strong></p>
    <br/><br/>
    <b>ePayments</b>
  `;
};
