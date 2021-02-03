/**
 * Sessions Controller module.
 * @module src/controllers/Sessions/index.js
 */
module.exports = {
  /**
   * Determines whether or not a user's session is still active based on their JWT.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {number} Network Status number
   */
  reviewSession(req, res) {
    res.send(200);
  },
  /**
   * Creates a new account and a session for a new user.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {object} JSON object
   */
  signUp(req, res) {
    res.send(200);
  },
  /**
   * Creates a new session for an existing user.
   *
   * @param {object} req - Express.js Request
   * @param {object} res - Express.js Response
   *
   * @return {number} JSON object
   */
  logIn(req, res) {
    res.send(200);
  },
};
