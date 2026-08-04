module.exports = {
  MockUser: {
    type: 'object',
    description: 'Usuario simulado (no persistido). A diferencia del schema User real, expone el password en texto plano.',
    properties: {
      _id: { type: 'string', example: '64f1c2b8e1b1c8a1b8e1b1c8' },
      firstName: { type: 'string', example: 'Fernando' },
      lastName: { type: 'string', example: 'Palto' },
      email: { type: 'string', format: 'email', example: 'fernando@shipnow.com' },
      password: { type: 'string', example: 'aB3xR9k2Lm' },
      role: { type: 'string', enum: ['admin', 'user', 'delivery'], example: 'user' },
    },
  },
  MockOrder: {
    type: 'object',
    description: 'Pedido simulado (no persistido), asociado a un MockUser del mismo lote.',
    properties: {
      _id: { type: 'string', example: '64f1c2b8e1b1c8a1b8e1b1ca' },
      user: { type: 'string', example: '64f1c2b8e1b1c8a1b8e1b1c8' },
      items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
      totalAmount: { type: 'number', example: 150 },
      status: {
        type: 'string',
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        example: 'pending',
      },
      priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' },
    },
  },
  MockDelivery: {
    type: 'object',
    description: 'Entrega simulada (no persistida), asociada a un MockOrder y un MockUser con rol delivery del mismo lote.',
    properties: {
      _id: { type: 'string', example: '64f1c2b8e1b1c8a1b8e1b1cb' },
      order: { type: 'string', example: '64f1c2b8e1b1c8a1b8e1b1ca' },
      deliveryAgent: { type: 'string', example: '64f1c2b8e1b1c8a1b8e1b1cc' },
      status: { type: 'string', enum: ['assigned', 'in_transit', 'delivered', 'failed'], example: 'assigned' },
      address: { type: 'string', example: 'Calle Falsa 123' },
      estimatedDeliveryDate: { type: 'string', format: 'date-time', example: '2026-08-10T15:00:00.000Z' },
    },
  },
  MockPreview: {
    type: 'object',
    properties: {
      users: { type: 'array', items: { $ref: '#/components/schemas/MockUser' } },
      deliveryAgents: { type: 'array', items: { $ref: '#/components/schemas/MockUser' } },
      orders: { type: 'array', items: { $ref: '#/components/schemas/MockOrder' } },
      deliveries: { type: 'array', items: { $ref: '#/components/schemas/MockDelivery' } },
    },
  },
  GenerateMocksInput: {
    type: 'object',
    description: 'Todos los campos son opcionales (valores por defecto: users=5, deliveryAgents=3, orders=5, deliveries=5). Maximo 100 por campo.',
    properties: {
      users: { type: 'integer', minimum: 0, maximum: 100, example: 10 },
      deliveryAgents: { type: 'integer', minimum: 0, maximum: 100, example: 5 },
      orders: { type: 'integer', minimum: 0, maximum: 100, example: 10 },
      deliveries: { type: 'integer', minimum: 0, maximum: 100, example: 10 },
    },
  },
  GenerateMocksSummary: {
    type: 'object',
    description: 'Cantidad de documentos efectivamente insertados en MongoDB.',
    properties: {
      users: { type: 'integer', example: 10 },
      deliveryAgents: { type: 'integer', example: 5 },
      orders: { type: 'integer', example: 10 },
      deliveries: { type: 'integer', example: 10 },
    },
  },
};
