/**
 * Module for utilities methods dedicated to
 * generating/building unique values such as passwords.
 * @module src/utils/generators/index.js
 */
const bcrypt = require('bcrypt-nodejs');

module.exports = {
  generatePassword(password) {
    return new Promise(function (resolve, reject) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return reject(err);
        }
        bcrypt.hash(password, salt, null, (err, hash) => {
          if (err) {
            return reject(err);
          }
          return resolve(hash);
        });
      });
    });
  },
};
