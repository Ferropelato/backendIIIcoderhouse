const OrderModel = require('../models/order.model');

class OrderRepository {
  async getAll(filter = {}) {
    return OrderModel.find(filter).select('-__v');
  }

  async getById(id) {
    return OrderModel.findById(id).select('-__v');
  }

  async create(orderData) {
    return OrderModel.create(orderData);
  }

  async createMany(ordersData) {
    return OrderModel.insertMany(ordersData);
  }

  async updateById(id, updates) {
    return OrderModel.findByIdAndUpdate(id, updates, { new: true }).select('-__v');
  }
}

module.exports = new OrderRepository();
