const swaggerUi = require('swagger-ui-express');

const schemas = {
  ...require('./schemas/user.schema'),
  ...require('./schemas/product.schema'),
  ...require('./schemas/order.schema'),
  ...require('./schemas/delivery.schema'),
  ...require('./schemas/mock.schema'),
  ...require('./schemas/file.schema'),
  ...require('./schemas/common.schema'),
};

const paths = {
  ...require('./paths/users.paths'),
  ...require('./paths/products.paths'),
  ...require('./paths/orders.paths'),
  ...require('./paths/deliveries.paths'),
  ...require('./paths/mocks.paths'),
  ...require('./paths/logs.paths'),
};

function buildSwaggerSpec(port) {
  return {
    openapi: '3.0.3',
    info: {
      title: 'ShipNow API',
      version: '1.0.0',
      description:
        'API de ShipNow: gestion de usuarios, productos, pedidos y entregas, con arquitectura por capas ' +
        '(Controller-Service-Repository), un modulo de mocking para generar datos de prueba, manejo ' +
        'centralizado de errores, logging profesional con Winston, y carga de documentos/comprobantes con Multer.',
    },
    servers: [{ url: `http://localhost:${port}/api`, description: 'Servidor local' }],
    tags: [
      { name: 'Users', description: 'Registro, login y administracion de usuarios' },
      { name: 'Products', description: 'Catalogo de productos de ShipNow' },
      { name: 'Orders', description: 'Pedidos realizados por los usuarios' },
      { name: 'Deliveries', description: 'Entregas asociadas a pedidos y repartidores' },
      { name: 'Mocks', description: 'Generacion de datos de prueba: usuarios, repartidores, pedidos y entregas' },
      { name: 'Logger', description: 'Herramienta interna para validar el logger, no es funcionalidad de negocio' },
    ],
    paths,
    components: { schemas },
  };
}

function setupSwagger(app, port) {
  const swaggerSpec = buildSwaggerSpec(port);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
