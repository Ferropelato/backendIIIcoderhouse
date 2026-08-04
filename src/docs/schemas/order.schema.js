module.exports = {
  OrderItem: {
    type: 'object',
    properties: {
      title: { type: 'string', example: 'Zapatillas running' },
      quantity: { type: 'number', example: 2 },
      price: { type: 'number', example: 50 },
    },
  },
  Order: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '64f1c2b8e1b1c8a1b8e1b1ca' },
      user: { type: 'string', description: 'Id del usuario dueño del pedido', example: '64f1c2b8e1b1c8a1b8e1b1c8' },
      items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
      totalAmount: { type: 'number', example: 100 },
      status: {
        type: 'string',
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        example: 'pending',
      },
      priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' },
    },
  },
  CreateOrderInput: {
    type: 'object',
    required: ['user', 'items'],
    properties: {
      user: { type: 'string', description: 'Id de un usuario ya existente', example: '64f1c2b8e1b1c8a1b8e1b1c8' },
      items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' }, minItems: 1 },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Opcional. Por defecto "medium".',
        example: 'medium',
      },
    },
  },
  UpdateOrderStatusInput: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        example: 'confirmed',
      },
    },
  },
};
