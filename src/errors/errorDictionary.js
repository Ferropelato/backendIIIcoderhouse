const ERROR_DICTIONARY = Object.freeze({
  VALIDATION_ERROR: Object.freeze({ code: 'VALIDATION_ERROR', statusCode: 400 }),
  NOT_FOUND: Object.freeze({ code: 'NOT_FOUND', statusCode: 404 }),
  CONFLICT: Object.freeze({ code: 'CONFLICT', statusCode: 409 }),
  UNAUTHORIZED: Object.freeze({ code: 'UNAUTHORIZED', statusCode: 401 }),
  FORBIDDEN: Object.freeze({ code: 'FORBIDDEN', statusCode: 403 }),
  INTERNAL_SERVER_ERROR: Object.freeze({ code: 'INTERNAL_SERVER_ERROR', statusCode: 500 }),
});

module.exports = ERROR_DICTIONARY;
