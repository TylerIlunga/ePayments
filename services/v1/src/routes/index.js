/**
 * Express Routing module.
 * @module src/routes/index.js
 */
const Router = require('express').Router();
const SessionController = require('../controllers/Session');
const UserController = require('../controllers/User');
const ProfileController = require('../controllers/Profile');

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

/** API Endpoints related to handling user profile business logic */
Router.post(
  '/api/v1/profile/customer/create',
  ProfileController.customerCreation,
);
Router.post(
  '/api/v1/profile/business/create',
  ProfileController.businessCreation,
);
Router.put('/api/v1/profile/business/update', ProfileController.businessUpdate);
Router.put('/api/v1/profile/customer/update', ProfileController.customerUpdate);

module.exports = Router;
