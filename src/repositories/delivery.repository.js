const DeliveryModel = require('../models/delivery.model');

class DeliveryRepository {
  async getAll(filter = {}) {
    return DeliveryModel.find(filter).select('-__v');
  }

  async getById(id) {
    return DeliveryModel.findById(id).select('-__v');
  }

  async create(deliveryData) {
    return DeliveryModel.create(deliveryData);
  }

  async createMany(deliveriesData) {
    return DeliveryModel.insertMany(deliveriesData);
  }
}

module.exports = new DeliveryRepository();
