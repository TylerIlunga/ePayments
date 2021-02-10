module.exports = ({ user }) => {
  return `
    <p>Below is your Reset Token:</p>
    <h3>${user.passwordResetToken}</h3>
    <br/><br/>
    <b>Mizu Team</b>
  `;
};
