const { AppError, ERROR_DICTIONARY } = require('../errors');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
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
    return res.status(ERROR_DICTIONARY.VALIDATION_ERROR.statusCode).json({
      status: 'error',
      error: { code: ERROR_DICTIONARY.VALIDATION_ERROR.code, message: err.message },
    });
  }

  console.error(err);

  return res.status(ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.statusCode).json({
    status: 'error',
    error: {
      code: ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.code,
      message: 'Ocurrio un error inesperado en el servidor',
    },
  });
}

module.exports = errorHandler;
