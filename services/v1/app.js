/**
 * Application Configuration module.
 * @module app.js
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const routes = require('./src/routes');
const config = require('./src/config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(config.JWT.secret));
app.use(logger('dev'));
app.use((req, res, next) => {
  console.log('process.env.CLIENT_URL:', process.env.CLIENT_URL);
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);
  res.setHeader('Access-Control-Allow-Headers', process.env.CLIENT_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
  );
  next();
});
app.use('/', routes);

module.exports = app;
