const mockService = require('../services/mock.service');

class MockController {
  previewUsers(req, res) {
    try {
      const users = mockService.previewUsers(req.query.count);
      res.status(200).json({ status: 'success', payload: users });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  previewDeliveryAgents(req, res) {
    try {
      const deliveryAgents = mockService.previewDeliveryAgents(req.query.count);
      res.status(200).json({ status: 'success', payload: deliveryAgents });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  previewOrders(req, res) {
    try {
      const orders = mockService.previewOrders(req.query.count, req.query.users);
      res.status(200).json({ status: 'success', payload: orders });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  previewDeliveries(req, res) {
    try {
      const deliveries = mockService.previewDeliveries(req.query.count, req.query.orders, req.query.agents);
      res.status(200).json({ status: 'success', payload: deliveries });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  previewAll(req, res) {
    try {
      const { users, deliveryAgents, orders, deliveries } = req.query;
      const data = mockService.generatePreview({ users, deliveryAgents, orders, deliveries });
      res.status(200).json({ status: 'success', payload: data });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async generate(req, res) {
    try {
      const { users, deliveryAgents, orders, deliveries } = req.body;
      const summary = await mockService.insertMockData({ users, deliveryAgents, orders, deliveries });
      res.status(201).json({
        status: 'success',
        message: 'Datos de prueba insertados en la base de datos',
        payload: summary,
      });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new MockController();
