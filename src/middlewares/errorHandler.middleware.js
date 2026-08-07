const multer = require('multer');
const { AppError, ERROR_DICTIONARY, FileTooLargeError, UnexpectedFileFieldError, ValidationError } = require('../errors');
const { MAX_FILE_SIZE_MB } = require('../uploads/multer.config');
const logger = require('../logger');

function mapMulterError(err) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new FileTooLargeError(MAX_FILE_SIZE_MB);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new UnexpectedFileFieldError(err.field);
  }
  return new ValidationError(`Error al procesar el archivo: ${err.message}`);
}

function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return errorHandler(mapMulterError(err), req, res, next);
  }

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
