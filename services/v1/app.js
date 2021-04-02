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
app.use(logger('dev'));
app.use('/', routes);

module.exports = app;
