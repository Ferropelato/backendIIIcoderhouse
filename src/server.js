const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');

async function startServer() {
  await mongoose.connect(config.mongoUri);
  console.log('Conectado a MongoDB');

  app.listen(config.port, () => {
    console.log(`Servidor ShipNow corriendo en el puerto ${config.port}`);
  });
}

startServer().catch((error) => {
  console.error('Error al iniciar el servidor:', error.message);
  process.exit(1);
});
