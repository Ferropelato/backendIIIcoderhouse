module.exports = {
  SuccessResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'success' },
      message: { type: 'string', example: 'Operacion realizada correctamente' },
      payload: { type: 'object', description: 'Depende del endpoint: puede ser un objeto, un array o un resumen.' },
    },
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      error: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Codigo estable del error, ver diccionario de errores en el README.',
            enum: ['VALIDATION_ERROR', 'NOT_FOUND', 'CONFLICT', 'UNAUTHORIZED', 'FORBIDDEN', 'INTERNAL_SERVER_ERROR'],
            example: 'NOT_FOUND',
          },
          message: { type: 'string', example: 'Producto con id 64f1c2b8e1b1c8a1b8e1b1c9 no encontrado' },
          details: {
            type: 'object',
            nullable: true,
            description: 'Presente solo en algunos errores (ej: campo invalido, id, valores permitidos).',
          },
        },
      },
    },
  },
};
