const { errorResponse, successResponse } = require('../responses');

const deliveryArraySchema = { type: 'array', items: { $ref: '#/components/schemas/Delivery' } };
const deliverySchema = { $ref: '#/components/schemas/Delivery' };

module.exports = {
  '/deliveries': {
    get: {
      tags: ['Deliveries'],
      summary: 'Listar entregas',
      responses: {
        200: successResponse('Lista de entregas', deliveryArraySchema),
        500: errorResponse('Error inesperado del servidor'),
      },
    },
    post: {
      tags: ['Deliveries'],
      summary: 'Crear una entrega',
      description: 'El pedido debe existir y el repartidor debe ser un usuario con rol "delivery".',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDeliveryInput' } } },
      },
      responses: {
        201: successResponse('Entrega creada', deliverySchema),
        400: errorResponse('El deliveryAgent no existe o no tiene rol "delivery"'),
        404: errorResponse('El pedido indicado no existe'),
      },
    },
  },
  '/deliveries/{did}': {
    get: {
      tags: ['Deliveries'],
      summary: 'Obtener una entrega por id',
      parameters: [
        { name: 'did', in: 'path', required: true, schema: { type: 'string' }, description: 'Id de la entrega' },
      ],
      responses: {
        200: successResponse('Entrega encontrada', deliverySchema),
        400: errorResponse('El id no tiene un formato valido'),
        404: errorResponse('No existe una entrega con ese id'),
      },
    },
  },
  '/deliveries/{did}/status': {
    patch: {
      tags: ['Deliveries'],
      summary: 'Cambiar el estado de una entrega',
      parameters: [
        { name: 'did', in: 'path', required: true, schema: { type: 'string' }, description: 'Id de la entrega' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateDeliveryStatusInput' } } },
      },
      responses: {
        200: successResponse('Estado actualizado', deliverySchema),
        400: errorResponse('Estado invalido (no pertenece a assigned/in_transit/delivered/failed)'),
        404: errorResponse('No existe una entrega con ese id'),
      },
    },
  },
  '/deliveries/{did}/voucher': {
    post: {
      tags: ['Deliveries'],
      summary: 'Subir un comprobante asociado a una entrega',
      description:
        'Sube un archivo (imagen o PDF, maximo 5MB) y lo asocia a la entrega. Solo se guardan los metadatos en la ' +
        'base de datos; el archivo se guarda en el servidor bajo uploads/delivery-vouchers/.',
      parameters: [
        { name: 'did', in: 'path', required: true, schema: { type: 'string' }, description: 'Id de la entrega' },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': { schema: { $ref: '#/components/schemas/UploadDeliveryVoucherInput' } },
        },
      },
      responses: {
        201: successResponse('Comprobante cargado y asociado a la entrega', deliverySchema),
        400: errorResponse(
          'Archivo faltante, tipo de archivo no permitido, archivo demasiado grande, campo incorrecto o ' +
          'tipo de comprobante invalido (delivery_proof/signature/invoice)'
        ),
        404: errorResponse('No existe una entrega con ese id'),
      },
    },
  },
};
