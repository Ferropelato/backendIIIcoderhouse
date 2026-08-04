const orderService = require('../services/order.service');
const catchAsync = require('../utils/catchAsync');

class OrderController {
  getAll = catchAsync(async (req, res) => {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ status: 'success', payload: orders });
  });

  getById = catchAsync(async (req, res) => {
    const order = await orderService.getOrderById(req.params.oid);
    res.status(200).json({ status: 'success', payload: order });
  });

  create = catchAsync(async (req, res) => {
    const order = await orderService.createOrder(req.body);
    res.status(201).json({ status: 'success', payload: order });
  });

  updateStatus = catchAsync(async (req, res) => {
    const order = await orderService.updateOrderStatus(req.params.oid, req.body.status);
    res.status(200).json({ status: 'success', payload: order });
  });
}

module.exports = new OrderController();
