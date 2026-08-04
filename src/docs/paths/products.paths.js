const { errorResponse, successResponse } = require('../responses');

const productArraySchema = { type: 'array', items: { $ref: '#/components/schemas/Product' } };
const productSchema = { $ref: '#/components/schemas/Product' };

module.exports = {
  '/products': {
    get: {
      tags: ['Products'],
      summary: 'Listar productos',
      parameters: [
        {
          name: 'available',
          in: 'query',
          required: false,
          schema: { type: 'boolean' },
          description: 'Si es "true", devuelve solo productos con status "available" y stock > 0.',
        },
      ],
      responses: {
        200: successResponse('Lista de productos', productArraySchema),
        500: errorResponse('Error inesperado del servidor'),
      },
    },
    post: {
      tags: ['Products'],
      summary: 'Crear un producto',
      description: 'El status ("available"/"out_of_stock") se calcula automaticamente segun el stock enviado.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProductInput' } } },
      },
      responses: {
        201: successResponse('Producto creado', productSchema),
        400: errorResponse('Datos invalidos (falta un campo requerido, precio o stock negativo, etc.)'),
        409: errorResponse('Ya existe un producto con ese codigo'),
      },
    },
  },
  '/products/{pid}': {
    get: {
      tags: ['Products'],
      summary: 'Obtener un producto por id',
      parameters: [
        { name: 'pid', in: 'path', required: true, schema: { type: 'string' }, description: 'Id del producto' },
      ],
      responses: {
        200: successResponse('Producto encontrado', productSchema),
        400: errorResponse('El id no tiene un formato valido'),
        404: errorResponse('No existe un producto con ese id'),
      },
    },
    put: {
      tags: ['Products'],
      summary: 'Actualizar un producto',
      description: 'Si se actualiza el stock, el status se recalcula automaticamente.',
      parameters: [
        { name: 'pid', in: 'path', required: true, schema: { type: 'string' }, description: 'Id del producto' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProductInput' } } },
      },
      responses: {
        200: successResponse('Producto actualizado', productSchema),
        400: errorResponse('Datos invalidos'),
        404: errorResponse('No existe un producto con ese id'),
      },
    },
    delete: {
      tags: ['Products'],
      summary: 'Eliminar un producto',
      parameters: [
        { name: 'pid', in: 'path', required: true, schema: { type: 'string' }, description: 'Id del producto' },
      ],
      responses: {
        200: successResponse('Producto eliminado'),
        404: errorResponse('No existe un producto con ese id'),
      },
    },
  },
};
