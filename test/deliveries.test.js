const { expect } = require('chai');
const request = require('supertest');
const { app, createUser, createDeliveryAgent, createOrder, createDelivery } = require('./helpers/fixtures');

describe('Deliveries API', () => {
  describe('POST /api/deliveries', () => {
    it('crea una entrega valida asociada a un pedido y a un repartidor', async () => {
      const order = await createOrder();
      const agent = await createDeliveryAgent();

      const res = await request(app).post('/api/deliveries').send({
        order: order._id,
        deliveryAgent: agent.id,
        address: 'Calle Falsa 123',
        estimatedDeliveryDate: new Date().toISOString(),
      });

      expect(res.status).to.equal(201);
      expect(res.body.payload).to.include({ order: order._id, deliveryAgent: agent.id, status: 'assigned' });
    });

    it('responde 404 (NOT_FOUND) si el pedido no existe', async () => {
      const agent = await createDeliveryAgent();

      const res = await request(app).post('/api/deliveries').send({
        order: '64b000000000000000000001',
        deliveryAgent: agent.id,
        address: 'Calle Falsa 123',
        estimatedDeliveryDate: new Date().toISOString(),
      });

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('NOT_FOUND');
    });

    it('responde 400 (VALIDATION_ERROR) si el repartidor no tiene rol "delivery"', async () => {
      const order = await createOrder();
      const notAnAgent = await createUser();

      const res = await request(app).post('/api/deliveries').send({
        order: order._id,
        deliveryAgent: notAnAgent.id,
        address: 'Calle Falsa 123',
        estimatedDeliveryDate: new Date().toISOString(),
      });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
    });
  });

  describe('GET /api/deliveries/:did', () => {
    it('devuelve la entrega solicitada', async () => {
      const delivery = await createDelivery();

      const res = await request(app).get(`/api/deliveries/${delivery._id}`);

      expect(res.status).to.equal(200);
      expect(res.body.payload._id).to.equal(delivery._id);
    });

    it('responde 404 (NOT_FOUND) si la entrega no existe', async () => {
      const res = await request(app).get('/api/deliveries/64b000000000000000000001');

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('NOT_FOUND');
    });
  });

  describe('PATCH /api/deliveries/:did/status', () => {
    it('actualiza el estado a un valor permitido', async () => {
      const delivery = await createDelivery();

      const res = await request(app)
        .patch(`/api/deliveries/${delivery._id}/status`)
        .send({ status: 'in_transit' });

      expect(res.status).to.equal(200);
      expect(res.body.payload.status).to.equal('in_transit');
    });

    it('responde 400 (VALIDATION_ERROR) con un estado invalido', async () => {
      const delivery = await createDelivery();

      const res = await request(app)
        .patch(`/api/deliveries/${delivery._id}/status`)
        .send({ status: 'no-existe' });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('VALIDATION_ERROR');
    });
  });
});
