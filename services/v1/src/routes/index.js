/**
 * Express Routing module.
 * @module src/routes/index.js
 */
const Router = require('express').Router();
const SessionController = require('../controllers/Session');
const UserController = require('../controllers/User');

/** Service Health Check */
Router.get('/healthcheck', (req, res) => res.sendStatus(200));

/** API Endpoints related to handling user sessions */
Router.get('/api/v1/session/review', SessionController.reviewSession);
Router.post('/api/v1/session/signup', SessionController.signUp);
Router.post('/api/v1/session/login', SessionController.logIn);
Router.get('/api/v1/session/logout', SessionController.logOut);

/** API Endpoints related to handling user business logic */
Router.post('/api/v1/user/activateAccount', UserController.activateAccount);
Router.post('/api/v1/user/forgotPassword', UserController.forgotPassword);
Router.post('/api/v1/user/resetPassword', UserController.resetPassword);

module.exports = Router;
