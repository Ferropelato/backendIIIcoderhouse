const { expect } = require('chai');
const request = require('supertest');
const { app } = require('./helpers/fixtures');

describe('Mocks API', () => {
  describe('GET /api/mocks/users', () => {
    it('genera usuarios simulados sin guardarlos en la base', async () => {
      const res = await request(app).get('/api/mocks/users?count=3');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.be.an('array').with.lengthOf(3);
      res.body.payload.forEach((user) => {
        expect(user.role).to.equal('user');
        expect(user).to.have.property('password');
      });

      const dbCheck = await request(app).get('/api/users');
      expect(dbCheck.body.payload).to.be.an('array').with.lengthOf(0);
    });

    it('responde 400 (VALIDATION_ERROR) con una cantidad negativa', async () => {
      const res = await request(app).get('/api/mocks/users?count=-1');

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
    });

    it('responde 400 (VALIDATION_ERROR) si supera el maximo permitido', async () => {
      const res = await request(app).get('/api/mocks/users?count=500');

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
    });
  });

  describe('GET /api/mocks/orders', () => {
    it('responde 400 (VALIDATION_ERROR) al pedir pedidos sin usuarios', async () => {
      const res = await request(app).get('/api/mocks/orders?count=2&users=0');

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
    });
  });

  describe('GET /api/mocks/preview', () => {
    it('devuelve las 4 entidades relacionadas entre si', async () => {
      const res = await request(app).get('/api/mocks/preview?users=2&deliveryAgents=1&orders=2&deliveries=1');

      expect(res.status).to.equal(200);
      const { users, deliveryAgents, orders, deliveries } = res.body.payload;
      expect(users).to.have.lengthOf(2);
      expect(deliveryAgents).to.have.lengthOf(1);
      expect(orders).to.have.lengthOf(2);
      expect(deliveries).to.have.lengthOf(1);

      const userIds = users.map((u) => u._id);
      const agentIds = deliveryAgents.map((a) => a._id);
      const orderIds = orders.map((o) => o._id);

      orders.forEach((order) => expect(userIds).to.include(order.user));
      deliveries.forEach((delivery) => {
        expect(orderIds).to.include(delivery.order);
        expect(agentIds).to.include(delivery.deliveryAgent);
      });
    });
  });

  describe('POST /api/mocks/generate', () => {
    it('inserta datos de prueba reales en MongoDB', async () => {
      const res = await request(app)
        .post('/api/mocks/generate')
        .send({ users: 3, deliveryAgents: 2, orders: 3, deliveries: 2 });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.deep.equal({ users: 3, deliveryAgents: 2, orders: 3, deliveries: 2 });

      const usersInDb = await request(app).get('/api/users');
      expect(usersInDb.body.payload).to.have.lengthOf(5);

      const ordersInDb = await request(app).get('/api/orders');
      expect(ordersInDb.body.payload).to.have.lengthOf(3);

      const deliveriesInDb = await request(app).get('/api/deliveries');
      expect(deliveriesInDb.body.payload).to.have.lengthOf(2);
    });

    it('responde 400 (VALIDATION_ERROR) con una cantidad invalida en el body', async () => {
      const res = await request(app).post('/api/mocks/generate').send({ users: -5 });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
    });
  });
});
