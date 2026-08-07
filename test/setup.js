require('dotenv').config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '4000';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shipnow-test-placeholder';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

exports.mochaHooks = {
  async beforeAll() {
    // La primera corrida en una maquina nueva descarga el binario de MongoDB
    // (una sola vez, despues queda cacheado), por eso el timeout es generoso.
    this.timeout(180000);
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  },

  async afterEach() {
    const collections = await mongoose.connection.db.collections();
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
  },

  async afterAll() {
    this.timeout(20000);
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  },
};
