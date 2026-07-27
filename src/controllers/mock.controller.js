const mockService = require('../services/mock.service');
const catchAsync = require('../utils/catchAsync');

class MockController {
  previewUsers = catchAsync((req, res) => {
    const users = mockService.previewUsers(req.query.count);
    res.status(200).json({ status: 'success', payload: users });
  });

  previewDeliveryAgents = catchAsync((req, res) => {
    const deliveryAgents = mockService.previewDeliveryAgents(req.query.count);
    res.status(200).json({ status: 'success', payload: deliveryAgents });
  });

  previewOrders = catchAsync((req, res) => {
    const orders = mockService.previewOrders(req.query.count, req.query.users);
    res.status(200).json({ status: 'success', payload: orders });
  });

  previewDeliveries = catchAsync((req, res) => {
    const deliveries = mockService.previewDeliveries(req.query.count, req.query.orders, req.query.agents);
    res.status(200).json({ status: 'success', payload: deliveries });
  });

  previewAll = catchAsync((req, res) => {
    const { users, deliveryAgents, orders, deliveries } = req.query;
    const data = mockService.generatePreview({ users, deliveryAgents, orders, deliveries });
    res.status(200).json({ status: 'success', payload: data });
  });

  generate = catchAsync(async (req, res) => {
    const { users, deliveryAgents, orders, deliveries } = req.body;
    const summary = await mockService.insertMockData({ users, deliveryAgents, orders, deliveries });
    res.status(201).json({
      status: 'success',
      message: 'Datos de prueba insertados en la base de datos',
      payload: summary,
    });
  });
}

module.exports = new MockController();
