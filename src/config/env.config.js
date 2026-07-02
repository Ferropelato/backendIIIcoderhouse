require('dotenv').config();

const REQUIRED_ENV_VARS = ['PORT', 'MONGODB_URI', 'NODE_ENV'];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno criticas: ${missing.join(', ')}. ` +
      'Crea un archivo .env en la raiz del proyecto (podes basarte en .env.example).'
    );
  }
}

validateEnv();

const config = Object.freeze({
  port: process.env.PORT,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV,
});

module.exports = config;
