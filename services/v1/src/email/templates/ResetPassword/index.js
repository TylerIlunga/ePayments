/**
 * Module for the email(s) generated for Resetting Passwords.
 * @module src/email/templates/ResetPassword/index.js
 */
module.exports = ({ user }) => {
  return `
    <p>Copy and paste your Reset Token below:</p>
    <h3>${user.password_reset_token}</h3>
    <br/><br/>
    <b>Mizu Team</b>
  `;
};
