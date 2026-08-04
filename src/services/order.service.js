const orderRepository = require('../repositories/order.repository');
const userRepository = require('../repositories/user.repository');
const { ORDER_STATUS, ORDER_PRIORITY } = require('../constants');
const { OrderNotFoundError, UserNotFoundError, InvalidStatusError } = require('../errors');
const logger = require('../logger');

class OrderService {
  async getAllOrders() {
    return orderRepository.getAll();
  }

  async getOrderById(id) {
    const order = await orderRepository.getById(id);
    if (!order) {
      throw new OrderNotFoundError(id);
    }
    return order;
  }

  async createOrder({ user, items, priority }) {
    const existingUser = await userRepository.getById(user);
    if (!existingUser) {
      throw new UserNotFoundError(user);
    }

    const totalAmount = Number(
      items.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2)
    );

    const validPriority = Object.values(ORDER_PRIORITY).includes(priority) ? priority : ORDER_PRIORITY.MEDIUM;

    const order = await orderRepository.create({
      user,
      items,
      totalAmount,
      status: ORDER_STATUS.PENDING,
      priority: validPriority,
    });

    logger.info(`Pedido creado correctamente: id=${order._id}, usuario=${user}, total=${totalAmount}`);

    return order;
  }

  async updateOrderStatus(id, status) {
    if (!Object.values(ORDER_STATUS).includes(status)) {
      throw new InvalidStatusError('pedido', status, Object.values(ORDER_STATUS));
    }

    const order = await orderRepository.updateById(id, { status });
    if (!order) {
      throw new OrderNotFoundError(id);
    }
    return order;
  }
}

module.exports = new OrderService();
