const { expect } = require('chai');
const request = require('supertest');
const { app, createUser, createOrder } = require('./helpers/fixtures');

describe('Orders API', () => {
  describe('POST /api/orders', () => {
    it('crea un pedido valido calculando el total en el servidor', async () => {
      const user = await createUser();

      const res = await request(app).post('/api/orders').send({
        user: user.id,
        items: [{ title: 'Producto', quantity: 2, price: 25 }],
      });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.payload).to.include({ status: 'pending', priority: 'medium', totalAmount: 50 });
      expect(res.body.payload.user).to.equal(user.id);
    });

    it('responde 404 (NOT_FOUND) si el usuario del pedido no existe', async () => {
      const res = await request(app).post('/api/orders').send({
        user: '64b000000000000000000001',
        items: [{ title: 'Producto', quantity: 1, price: 10 }],
      });

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('NOT_FOUND');
    });

    it('responde 400 (VALIDATION_ERROR) si el pedido no tiene items', async () => {
      const user = await createUser();

      const res = await request(app).post('/api/orders').send({ user: user.id, items: [] });

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal('error');
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
    });
  });

  describe('GET /api/orders', () => {
    it('devuelve la lista de pedidos creados', async () => {
      await createOrder();
      await createOrder();

      const res = await request(app).get('/api/orders');

      expect(res.status).to.equal(200);
      expect(res.body.payload).to.be.an('array').with.lengthOf(2);
    });
  });

  describe('GET /api/orders/:oid', () => {
    it('devuelve el pedido solicitado por id', async () => {
      const order = await createOrder();

      const res = await request(app).get(`/api/orders/${order._id}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload._id).to.equal(order._id);
      expect(res.body.payload).to.have.property('totalAmount');
    });

    it('responde 404 (NOT_FOUND) si el pedido no existe', async () => {
      const res = await request(app).get('/api/orders/64b000000000000000000001');

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('NOT_FOUND');
    });
  });

  describe('PATCH /api/orders/:oid/status', () => {
    it('actualiza el estado a un valor permitido', async () => {
      const order = await createOrder();

      const res = await request(app).patch(`/api/orders/${order._id}/status`).send({ status: 'confirmed' });

      expect(res.status).to.equal(200);
      expect(res.body.payload.status).to.equal('confirmed');
    });

    it('responde 400 (VALIDATION_ERROR) con un estado invalido', async () => {
      const order = await createOrder();

      const res = await request(app).patch(`/api/orders/${order._id}/status`).send({ status: 'no-existe' });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
      expect(res.body.error.message).to.include('no-existe');
    });

    it('responde 404 (NOT_FOUND) si el pedido no existe', async () => {
      const res = await request(app)
        .patch('/api/orders/64b000000000000000000001/status')
        .send({ status: 'confirmed' });

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('NOT_FOUND');
    });
  });
});
