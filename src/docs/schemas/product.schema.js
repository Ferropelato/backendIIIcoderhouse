module.exports = {
  Product: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '64f1c2b8e1b1c8a1b8e1b1c9' },
      title: { type: 'string', example: 'Zapatillas running' },
      description: { type: 'string', example: 'Livianas, ideales para entrenar' },
      code: { type: 'string', example: 'SKU-001' },
      price: { type: 'number', example: 100 },
      stock: { type: 'number', example: 5 },
      category: { type: 'string', example: 'calzado' },
      status: { type: 'string', enum: ['available', 'out_of_stock'], example: 'available' },
      thumbnails: { type: 'array', items: { type: 'string' }, example: [] },
    },
  },
  CreateProductInput: {
    type: 'object',
    required: ['title', 'description', 'code', 'price', 'stock', 'category'],
    properties: {
      title: { type: 'string', example: 'Zapatillas running' },
      description: { type: 'string', example: 'Livianas, ideales para entrenar' },
      code: { type: 'string', example: 'SKU-001' },
      price: { type: 'number', example: 100 },
      stock: { type: 'number', example: 5 },
      category: { type: 'string', example: 'calzado' },
      thumbnails: { type: 'array', items: { type: 'string' } },
    },
  },
  UpdateProductInput: {
    type: 'object',
    description: 'Cualquier subconjunto de campos del producto a actualizar.',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      price: { type: 'number' },
      stock: { type: 'number', description: 'Actualizar el stock recalcula automaticamente el status.' },
      category: { type: 'string' },
      thumbnails: { type: 'array', items: { type: 'string' } },
    },
  },
};
