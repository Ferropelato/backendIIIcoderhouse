const express = require('express');
const routes = require('./routes');
const { RouteNotFoundError } = require('./errors');
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

app.use(express.json());
app.use('/api', routes);

app.use((req, res, next) => {
  next(new RouteNotFoundError(req.method, req.originalUrl));
});

app.use(errorHandler);

module.exports = app;
