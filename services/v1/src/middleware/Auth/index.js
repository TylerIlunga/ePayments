/**
 * Request Authorization module for session protected API endpoints.
 * @module src/middleware/Auth/index.js
 */

const { User } = require('../../dal/config');
const { Errors, Tokens } = require('../../utils');

module.exports = {
  evaluateSession(req, res, next) {
    // Check if the session cookie exists containing our session token("ut")
    console.log('req.cookies:', req.cookies);
    const sessionCookieToken = req.cookies.ut;
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
      User.findOne({ where: { id: vTRes.data.userID } })
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
