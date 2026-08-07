module.exports = {
  Delivery: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '64f1c2b8e1b1c8a1b8e1b1cb' },
      order: { type: 'string', description: 'Id del pedido asociado', example: '64f1c2b8e1b1c8a1b8e1b1ca' },
      deliveryAgent: {
        type: 'string',
        description: 'Id de un usuario con rol "delivery"',
        example: '64f1c2b8e1b1c8a1b8e1b1cc',
      },
      status: {
        type: 'string',
        enum: ['assigned', 'in_transit', 'delivered', 'failed'],
        example: 'assigned',
      },
      address: { type: 'string', example: 'Calle Falsa 123' },
      estimatedDeliveryDate: { type: 'string', format: 'date-time', example: '2026-08-10T15:00:00.000Z' },
      vouchers: { type: 'array', items: { $ref: '#/components/schemas/FileMetadata' } },
    },
  },
  CreateDeliveryInput: {
    type: 'object',
    required: ['order', 'deliveryAgent', 'address', 'estimatedDeliveryDate'],
    properties: {
      order: { type: 'string', description: 'Id de un pedido ya existente', example: '64f1c2b8e1b1c8a1b8e1b1ca' },
      deliveryAgent: {
        type: 'string',
        description: 'Id de un usuario con rol "delivery"',
        example: '64f1c2b8e1b1c8a1b8e1b1cc',
      },
      address: { type: 'string', example: 'Calle Falsa 123' },
      estimatedDeliveryDate: { type: 'string', format: 'date-time', example: '2026-08-10T15:00:00.000Z' },
    },
  },
  UpdateDeliveryStatusInput: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['assigned', 'in_transit', 'delivered', 'failed'],
        example: 'in_transit',
      },
    },
  },
};
