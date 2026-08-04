function errorResponse(description) {
  return {
    description,
    content: {
      'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
    },
  };
}

function successResponse(description, schema) {
  return {
    description,
    content: {
      'application/json': {
        schema: {
          allOf: [
            { $ref: '#/components/schemas/SuccessResponse' },
            schema ? { type: 'object', properties: { payload: schema } } : {},
          ],
        },
      },
    },
  };
}

module.exports = { errorResponse, successResponse };
