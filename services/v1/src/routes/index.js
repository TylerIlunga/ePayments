/**
 * Express Routing module.
 * @module src/routes/index.js
 */
const Router = require('express').Router();
const { evaluateSession } = require('../middleware/Auth');
const SessionController = require('../controllers/Session');
const UserController = require('../controllers/User');
const ProfileController = require('../controllers/Profile');
const BusinessProductController = require('../controllers/BusinessProduct');
const PaymentAccountController = require('../controllers/PaymentAccount');
const BusinessTransactionController = require('../controllers/BusinessTransaction');

/** Service Health Check */
Router.get('/healthcheck', (req, res) => res.sendStatus(200));

/** API Endpoints related to handling user sessions */
Router.post('/api/v1/session/signup', SessionController.signUp);
Router.post('/api/v1/session/login', SessionController.logIn);
Router.get('/api/v1/session/logout', evaluateSession, SessionController.logOut);

/** API Endpoints related to handling user accounts */
Router.post('/api/v1/user/activateAccount', UserController.activateAccount);
Router.post('/api/v1/user/forgotPassword', UserController.forgotPassword);
Router.post('/api/v1/user/resetPassword', UserController.resetPassword);

/** API Endpoints related to handling user profiles */
Router.post(
  '/api/v1/profile/fetch',
  evaluateSession,
  ProfileController.fetchProfile,
);
Router.post(
  '/api/v1/profile/customer/create',
  ProfileController.customerCreation,
);
Router.post(
  '/api/v1/profile/business/create',
  ProfileController.businessCreation,
);
Router.put(
  '/api/v1/profile/business/update',
  evaluateSession,
  ProfileController.businessUpdate,
);
Router.put(
  '/api/v1/profile/customer/update',
  evaluateSession,
  ProfileController.customerUpdate,
);

/** API Endpoints related to handling business products */
Router.post(
  '/api/v1/products/business/create',
  evaluateSession,
  BusinessProductController.createBusinessProduct,
);
Router.post(
  '/api/v1/products/business/import',
  evaluateSession,
  BusinessProductController.importBusinessProducts,
);
Router.post(
  '/api/v1/products/business/list',
  evaluateSession,
  BusinessProductController.listBusinessProducts,
);
Router.post(
  '/api/v1/products/business/fetch',
  evaluateSession,
  BusinessProductController.fetchBusinessProduct,
);
Router.put(
  '/api/v1/products/business/update',
  evaluateSession,
  BusinessProductController.updateBusinessProduct,
);
Router.delete(
  '/api/v1/products/business/delete',
  evaluateSession,
  BusinessProductController.deleteBusinessProduct,
);

/** API Endpoints related to handling connected payment accounts */
Router.post(
  '/api/v1/payment/accounts/fetch',
  evaluateSession,
  PaymentAccountController.fetchPaymentAccount,
);
Router.get(
  '/api/v1/payment/accounts/create/start',
  PaymentAccountController.createPaymentAccountStart,
);
Router.get(
  '/api/v1/payment/accounts/create/oauthcallback/code',
  PaymentAccountController.createPaymentAccountOAuthCodeCallback,
);
Router.put(
  '/api/v1/payment/accounts/conversion/toggle',
  evaluateSession,
  PaymentAccountController.toggleAutoConvertToFiatFeature,
);

/** API Endpoints related to handling business transactions */
Router.post(
  '/api/v1/transactions/create',
  evaluateSession,
  BusinessTransactionController.createBusinessTransaction,
);
Router.post(
  '/api/v1/transactions/list',
  evaluateSession,
  BusinessTransactionController.listBusinessTransactions,
);
Router.get(
  '/api/v1/transactions/fetch',
  evaluateSession,
  BusinessTransactionController.fetchBusinessTransaction,
);

module.exports = Router;
