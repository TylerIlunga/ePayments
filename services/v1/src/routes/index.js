/**
 * Express Routing module.
 * @module src/routes/index.js
 */
const Router = require('express').Router();
const SessionsController = require('../controllers/Sessions');

/** Service Health Check */
Router.get('/healthcheck', (req, res) => res.sendStatus(200));

/** API Endpoints related to handling user sessions */
Router.get('/api/v1/sessions/review', SessionsController.reviewSession);
Router.post('/api/v1/sessions/signup', SessionsController.signUp);
Router.post('/api/v1/sessions/login', SessionsController.logIn);
Router.get('/api/v1/sessions/logout', SessionsController.logOut);

module.exports = Router;
