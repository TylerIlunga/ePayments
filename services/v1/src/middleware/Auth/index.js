/**
 * Request Authorization module for session protected API endpoints.
 * @module src/middleware/Auth/index.js
 */

const Cookies = require('universal-cookie');
const { User } = require('../../dal/config');
const { Errors, Tokens } = require('../../utils');

module.exports = {
  evaluateSession(req, res, next) {
    // Check if the session cookie exists containing our session token("ut")
    const cookies = new Cookies(req.headers.cookie);
    const sessionCookieToken = cookies.get('ut');
    if (sessionCookieToken === undefined || sessionCookieToken === null) {
      return res.json({ error: 'Session does not exist.' });
    }
    // Verify JWT in our session cookie
    console.log('sessionCookieToken:', sessionCookieToken);
    Tokens.verifyToken(sessionCookieToken, (vTRes) => {
      console.log('vTRes:', vTRes);
      if (vTRes.error) {
        return res.json({ error: vTRes.error });
      }
      // Verify that the user ID within the JWT maps to a user in our DB
      User.findOne({ where: { id: vTRes.userID } })
        .then((res) => {
          next();
        })
        .catch((error) => {
          Errors.General.logError('evaluateSession() User.findOne({})');
          Errors.General.logError(error);
          res.json({ error: 'User does not exist.' });
        });
    });
  },
};
