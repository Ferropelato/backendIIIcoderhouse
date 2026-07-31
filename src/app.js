const express = require('express');
const routes = require('./routes');
const { RouteNotFoundError } = require('./errors');
const errorHandler = require('./middlewares/errorHandler.middleware');
const logger = require('./logger');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  logger.http(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api', routes);

app.use((req, res, next) => {
  next(new RouteNotFoundError(req.method, req.originalUrl));
});

app.use(errorHandler);

module.exports = app;
