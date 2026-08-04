const { errorResponse, successResponse } = require('../responses');

const orderArraySchema = { type: 'array', items: { $ref: '#/components/schemas/Order' } };
const orderSchema = { $ref: '#/components/schemas/Order' };

module.exports = {
  '/orders': {
    get: {
      tags: ['Orders'],
      summary: 'Listar pedidos',
      responses: {
        200: successResponse('Lista de pedidos', orderArraySchema),
        500: errorResponse('Error inesperado del servidor'),
      },
    },
    post: {
      tags: ['Orders'],
      summary: 'Crear un pedido',
      description:
        'El total se calcula en el servidor a partir de los items. El status inicial siempre es "pending".',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderInput' } } },
      },
      responses: {
        201: successResponse('Pedido creado', orderSchema),
        400: errorResponse('Datos invalidos (items vacio, campos faltantes, etc.)'),
        404: errorResponse('El usuario indicado no existe'),
      },
    },
  },
  '/orders/{oid}': {
    get: {
      tags: ['Orders'],
      summary: 'Obtener un pedido por id',
      parameters: [
        { name: 'oid', in: 'path', required: true, schema: { type: 'string' }, description: 'Id del pedido' },
      ],
      responses: {
        200: successResponse('Pedido encontrado', orderSchema),
        400: errorResponse('El id no tiene un formato valido'),
        404: errorResponse('No existe un pedido con ese id'),
      },
    },
  },
  '/orders/{oid}/status': {
    patch: {
      tags: ['Orders'],
      summary: 'Cambiar el estado de un pedido',
      parameters: [
        { name: 'oid', in: 'path', required: true, schema: { type: 'string' }, description: 'Id del pedido' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateOrderStatusInput' } } },
      },
      responses: {
        200: successResponse('Estado actualizado', orderSchema),
        400: errorResponse('Estado invalido (no pertenece a pending/confirmed/shipped/delivered/cancelled)'),
        404: errorResponse('No existe un pedido con ese id'),
      },
    },
  },
};
