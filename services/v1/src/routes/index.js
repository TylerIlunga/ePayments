/**
 * Express Routing module.
 * @module src/routes/index.js
 */

const Router = require('express').Router();

Router.get('/healthcheck', (req, res) => res.sendStatus(200));

module.exports = Router;
