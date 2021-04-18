/**
 * Module for the email(s) generated for verifying accounts.
 * @module src/email/templates/VerifyAccount/index.js
 */
module.exports = ({ user }) => {
  return `
    Welcome to DigiCard!
    <br/><br/>
    We are really excited to give you more insight on your audience!
	  <br/><br/>
    <p><strong>Copy and Paste</strong> this Activation Token: <strong>${user.activation_token}</strong></p>
    <br/><br/>
    <b>Mizu Team</b>
  `;
};
