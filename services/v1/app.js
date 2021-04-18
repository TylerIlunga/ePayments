/**
 * Application Configuration module.
 * @module app.js
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('morgan');
const routes = require('./src/routes');
const config = require('./src/config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(config.JWT.secret));
app.use(cors());
// NOTES: Issues with Safari...
// app.use(
//   cors({
//     // Access-Control-Allow-Credentials
//     credentials: true,
//     // Access-Control-Allow-Origin
//     origin: process.env.CLIENT_URL,
//     // Access-Control-Allow-Methods
//     methods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
//     // Access-Control-Allow-Headers
//     allowedHeaders: [
//       'Access-Control-Allow-Headers',
//       'Origin',
//       'Accept',
//       'X-Requested-With',
//       'Content-Type',
//       'Access-Control-Request-Method',
//       'Access-Control-Request-Headers',
//     ],
//   }),
// );
app.use(logger('dev'));
app.use('/', routes);

module.exports = app;
