const request = require('supertest');
const app = require('../../src/app');

let counter = 0;
function uniqueEmail(prefix) {
  counter += 1;
  return `${prefix}${Date.now()}${counter}@shipnow-test.com`;
}

async function createUser(overrides = {}) {
  const res = await request(app).post('/api/users/register').send({
    firstName: 'Test',
    lastName: 'User',
    email: uniqueEmail('user'),
    password: '123456',
    ...overrides,
  });
  return res.body.payload;
}

async function createDeliveryAgent(overrides = {}) {
  return createUser({ role: 'delivery', ...overrides });
}

async function createOrder(overrides = {}) {
  const { user: userOverride, ...rest } = overrides;
  let userId = userOverride;
  if (!userId) {
    const user = await createUser();
    userId = user.id;
  }

  const res = await request(app)
    .post('/api/orders')
    .send({
      user: userId,
      items: [{ title: 'Producto de prueba', quantity: 1, price: 10 }],
      ...rest,
    });
  return res.body.payload;
}

module.exports = { app, createUser, createDeliveryAgent, createOrder, uniqueEmail };
