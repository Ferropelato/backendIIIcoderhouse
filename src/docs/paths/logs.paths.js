const { successResponse } = require('../responses');

module.exports = {
  '/logs/test': {
    get: {
      tags: ['Logger'],
      summary: 'Probar el logger en todos sus niveles',
      description:
        'Herramienta interna de validacion, NO representa una funcionalidad de negocio. ' +
        'Dispara un log de cada nivel configurado (debug, http, info, warning, error, fatal) usando Winston, ' +
        'visibles en la consola y en los archivos de logs/ (segun el entorno y el nivel de cada transport).',
      responses: {
        200: successResponse('Logs de prueba generados', {
          type: 'object',
          properties: {
            levels: {
              type: 'array',
              items: { type: 'string' },
              example: ['debug', 'http', 'info', 'warning', 'error', 'fatal'],
            },
          },
        }),
      },
    },
  },
};
