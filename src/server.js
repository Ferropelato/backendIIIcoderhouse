const mongoose = require('mongoose');
const logger = require('./logger');

let config;
try {
  config = require('./config');
} catch (error) {
  logger.fatal(`No se pudo iniciar la aplicacion por un error de configuracion: ${error.message}`);
  process.exit(1);
}

const app = require('./app');

async function startServer() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Conexion a MongoDB establecida');
  } catch (error) {
    logger.fatal(`No se pudo conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }

  app.listen(config.port, () => {
    logger.info(`Servidor ShipNow escuchando en el puerto ${config.port}`);
  });
}

startServer();
