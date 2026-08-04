const deliveryRepository = require('../repositories/delivery.repository');
const orderRepository = require('../repositories/order.repository');
const userRepository = require('../repositories/user.repository');
const { ROLES, DELIVERY_STATUS } = require('../constants');
const {
  DeliveryNotFoundError,
  OrderNotFoundError,
  InvalidDeliveryAgentError,
  InvalidStatusError,
} = require('../errors');

class DeliveryService {
  async getAllDeliveries() {
    return deliveryRepository.getAll();
  }

  async getDeliveryById(id) {
    const delivery = await deliveryRepository.getById(id);
    if (!delivery) {
      throw new DeliveryNotFoundError(id);
    }
    return delivery;
  }

  async createDelivery({ order, deliveryAgent, address, estimatedDeliveryDate }) {
    const existingOrder = await orderRepository.getById(order);
    if (!existingOrder) {
      throw new OrderNotFoundError(order);
    }

    const agent = await userRepository.getById(deliveryAgent);
    if (!agent || agent.role !== ROLES.DELIVERY) {
      throw new InvalidDeliveryAgentError(deliveryAgent);
    }

    return deliveryRepository.create({
      order,
      deliveryAgent,
      address,
      estimatedDeliveryDate,
      status: DELIVERY_STATUS.ASSIGNED,
    });
  }

  async updateDeliveryStatus(id, status) {
    if (!Object.values(DELIVERY_STATUS).includes(status)) {
      throw new InvalidStatusError('entrega', status, Object.values(DELIVERY_STATUS));
    }

    const delivery = await deliveryRepository.updateById(id, { status });
    if (!delivery) {
      throw new DeliveryNotFoundError(id);
    }
    return delivery;
  }
}

module.exports = new DeliveryService();
