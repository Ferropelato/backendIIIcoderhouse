const { AppError, ERROR_DICTIONARY } = require('../errors');
const logger = require('../logger');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    const logMessage = `${req.method} ${req.originalUrl} -> ${err.code}: ${err.message}`;
    if (err.statusCode >= 500) {
      logger.error(logMessage);
    } else {
      logger.warning(logMessage);
    }

    return res.status(err.statusCode).json({
      status: 'error',
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    logger.warning(`${req.method} ${req.originalUrl} -> ${ERROR_DICTIONARY.VALIDATION_ERROR.code}: ${err.message}`);

    return res.status(ERROR_DICTIONARY.VALIDATION_ERROR.statusCode).json({
      status: 'error',
      error: { code: ERROR_DICTIONARY.VALIDATION_ERROR.code, message: err.message },
    });
  }

  logger.error(`${req.method} ${req.originalUrl} -> Error inesperado: ${err.message}\n${err.stack}`);

  return res.status(ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.statusCode).json({
    status: 'error',
    error: {
      code: ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.code,
      message: 'Ocurrio un error inesperado en el servidor',
    },
  });
}

module.exports = errorHandler;
