const { errorResponse, successResponse } = require('../responses');

const countParam = (defaultValue) => ({
  name: 'count',
  in: 'query',
  required: false,
  schema: { type: 'integer', minimum: 0, maximum: 100, default: defaultValue },
  description: `Cantidad a generar (entero entre 0 y 100). Por defecto ${defaultValue}.`,
});

const invalidQuantityError = errorResponse(
  'Cantidad invalida: no es un entero, es negativa, o supera el maximo permitido (100)'
);
const relationError = errorResponse(
  'Relacion invalida entre entidades (ej: pedir pedidos sin usuarios, o entregas sin pedidos/repartidores)'
);

module.exports = {
  '/mocks/users': {
    get: {
      tags: ['Mocks'],
      summary: 'Previsualizar usuarios simulados',
      description: 'Genera usuarios falsos con rol "user". No se guardan en la base de datos.',
      parameters: [countParam(5)],
      responses: {
        200: successResponse('Usuarios simulados', { type: 'array', items: { $ref: '#/components/schemas/MockUser' } }),
        400: invalidQuantityError,
      },
    },
  },
  '/mocks/delivery-agents': {
    get: {
      tags: ['Mocks'],
      summary: 'Previsualizar repartidores simulados',
      description: 'Genera usuarios falsos con rol "delivery". No se guardan en la base de datos.',
      parameters: [countParam(3)],
      responses: {
        200: successResponse('Repartidores simulados', { type: 'array', items: { $ref: '#/components/schemas/MockUser' } }),
        400: invalidQuantityError,
      },
    },
  },
  '/mocks/orders': {
    get: {
      tags: ['Mocks'],
      summary: 'Previsualizar pedidos simulados',
      description: 'Genera usuarios falsos internamente y pedidos asociados a ellos. No se guarda nada en la base de datos.',
      parameters: [
        countParam(5),
        {
          name: 'users',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 0, maximum: 100, default: 5 },
          description: 'Cantidad de usuarios falsos a generar como dueños de los pedidos.',
        },
      ],
      responses: {
        200: successResponse('Pedidos simulados', { type: 'array', items: { $ref: '#/components/schemas/MockOrder' } }),
        400: { description: invalidQuantityError.description + ' / ' + relationError.description, content: invalidQuantityError.content },
      },
    },
  },
  '/mocks/deliveries': {
    get: {
      tags: ['Mocks'],
      summary: 'Previsualizar entregas simuladas',
      description:
        'Genera pedidos y repartidores falsos internamente, y entregas asociadas correctamente a ellos. No se guarda nada en la base de datos.',
      parameters: [
        countParam(5),
        {
          name: 'orders',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 0, maximum: 100, default: 5 },
          description: 'Cantidad de pedidos falsos a generar.',
        },
        {
          name: 'agents',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 0, maximum: 100, default: 3 },
          description: 'Cantidad de repartidores falsos a generar.',
        },
      ],
      responses: {
        200: successResponse('Entregas simuladas', { type: 'array', items: { $ref: '#/components/schemas/MockDelivery' } }),
        400: { description: invalidQuantityError.description + ' / ' + relationError.description, content: invalidQuantityError.content },
      },
    },
  },
  '/mocks/preview': {
    get: {
      tags: ['Mocks'],
      summary: 'Previsualizar las 4 entidades juntas',
      description: 'Genera usuarios, repartidores, pedidos y entregas del mismo lote, ya relacionados entre si. No se guarda nada en la base de datos.',
      parameters: [
        { name: 'users', in: 'query', required: false, schema: { type: 'integer', minimum: 0, maximum: 100, default: 5 } },
        { name: 'deliveryAgents', in: 'query', required: false, schema: { type: 'integer', minimum: 0, maximum: 100, default: 3 } },
        { name: 'orders', in: 'query', required: false, schema: { type: 'integer', minimum: 0, maximum: 100, default: 5 } },
        { name: 'deliveries', in: 'query', required: false, schema: { type: 'integer', minimum: 0, maximum: 100, default: 5 } },
      ],
      responses: {
        200: successResponse('Vista previa combinada', { $ref: '#/components/schemas/MockPreview' }),
        400: relationError,
      },
    },
  },
  '/mocks/generate': {
    post: {
      tags: ['Mocks'],
      summary: 'Insertar datos de prueba en MongoDB',
      description:
        'Genera y guarda en la base de datos usuarios, repartidores, pedidos y entregas relacionados entre si. ' +
        'Las contraseñas se guardan hasheadas, igual que en un registro real. Carga controlada: mismos limites y validaciones que los endpoints de preview.',
      requestBody: {
        required: false,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/GenerateMocksInput' } } },
      },
      responses: {
        201: successResponse('Datos de prueba insertados', { $ref: '#/components/schemas/GenerateMocksSummary' }),
        400: { description: invalidQuantityError.description + ' / ' + relationError.description, content: invalidQuantityError.content },
        500: errorResponse('Fallo real al insertar los datos de prueba en MongoDB (por ejemplo, la base de datos no esta disponible)'),
      },
    },
  },
};
