const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const userRepository = require('../repositories/user.repository');
const orderRepository = require('../repositories/order.repository');
const deliveryRepository = require('../repositories/delivery.repository');
const { ROLES, ORDER_STATUS, ORDER_PRIORITY, DELIVERY_STATUS } = require('../constants');
const { InvalidMockQuantityError, MockRelationError, MockGenerationError } = require('../errors');
const logger = require('../logger');

const MAX_MOCK_COUNT = 100;
const DEFAULT_COUNTS = { users: 5, deliveryAgents: 3, orders: 5, deliveries: 5 };

function clampCount(count, fieldName) {
  const parsed = Number(count);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0 || parsed > MAX_MOCK_COUNT) {
    throw new InvalidMockQuantityError(fieldName, count, MAX_MOCK_COUNT);
  }
  return parsed;
}

function randomFromEnum(enumObject) {
  const values = Object.values(enumObject);
  return faker.helpers.arrayElement(values);
}

function resolveCounts(rawCounts = {}) {
  return {
    users: rawCounts.users === undefined ? DEFAULT_COUNTS.users : clampCount(rawCounts.users, 'users'),
    deliveryAgents: rawCounts.deliveryAgents === undefined
      ? DEFAULT_COUNTS.deliveryAgents
      : clampCount(rawCounts.deliveryAgents, 'deliveryAgents'),
    orders: rawCounts.orders === undefined ? DEFAULT_COUNTS.orders : clampCount(rawCounts.orders, 'orders'),
    deliveries: rawCounts.deliveries === undefined
      ? DEFAULT_COUNTS.deliveries
      : clampCount(rawCounts.deliveries, 'deliveries'),
  };
}

function assertRelations({ users, deliveryAgents, orders, deliveries }) {
  if (orders > 0 && users === 0) {
    throw new MockRelationError('No se pueden generar pedidos sin usuarios: "users" debe ser mayor a 0');
  }
  if (deliveries > 0 && (orders === 0 || deliveryAgents === 0)) {
    throw new MockRelationError(
      'No se pueden generar entregas sin pedidos y repartidores: "orders" y "deliveryAgents" deben ser mayores a 0'
    );
  }
}

class MockService {
  buildFakeUser(role) {
    return {
      _id: new mongoose.Types.ObjectId(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 10 }),
      role,
    };
  }

  buildFakeUsers(count, role) {
    return Array.from({ length: count }, () => this.buildFakeUser(role));
  }

  buildFakeOrder(users) {
    const owner = faker.helpers.arrayElement(users);
    const items = Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
      title: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 5 }),
      price: Number(faker.commerce.price({ min: 10, max: 500 })),
    }));
    const totalAmount = Number(items.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2));

    return {
      _id: new mongoose.Types.ObjectId(),
      user: owner._id,
      items,
      totalAmount,
      status: randomFromEnum(ORDER_STATUS),
      priority: randomFromEnum(ORDER_PRIORITY),
    };
  }

  buildFakeOrders(count, users) {
    return Array.from({ length: count }, () => this.buildFakeOrder(users));
  }

  buildFakeDelivery(orders, deliveryAgents) {
    const order = faker.helpers.arrayElement(orders);
    const agent = faker.helpers.arrayElement(deliveryAgents);

    return {
      _id: new mongoose.Types.ObjectId(),
      order: order._id,
      deliveryAgent: agent._id,
      status: randomFromEnum(DELIVERY_STATUS),
      address: faker.location.streetAddress(),
      estimatedDeliveryDate: faker.date.soon({ days: 7 }),
    };
  }

  buildFakeDeliveries(count, orders, deliveryAgents) {
    return Array.from({ length: count }, () => this.buildFakeDelivery(orders, deliveryAgents));
  }

  previewUsers(count) {
    return this.buildFakeUsers(clampCount(count ?? DEFAULT_COUNTS.users, 'count'), ROLES.USER);
  }

  previewDeliveryAgents(count) {
    return this.buildFakeUsers(clampCount(count ?? DEFAULT_COUNTS.deliveryAgents, 'count'), ROLES.DELIVERY);
  }

  previewOrders(orderCount, userCount) {
    const counts = {
      orders: clampCount(orderCount ?? DEFAULT_COUNTS.orders, 'count'),
      users: clampCount(userCount ?? DEFAULT_COUNTS.users, 'users'),
    };
    assertRelations({ ...counts, deliveryAgents: 1, deliveries: 0 });
    const fakeUsers = this.buildFakeUsers(counts.users, ROLES.USER);
    return this.buildFakeOrders(counts.orders, fakeUsers);
  }

  previewDeliveries(deliveryCount, orderCount, agentCount) {
    const counts = {
      deliveries: clampCount(deliveryCount ?? DEFAULT_COUNTS.deliveries, 'count'),
      orders: clampCount(orderCount ?? DEFAULT_COUNTS.orders, 'orders'),
      deliveryAgents: clampCount(agentCount ?? DEFAULT_COUNTS.deliveryAgents, 'agents'),
    };
    assertRelations({ ...counts, users: 1 });
    const fakeUsers = this.buildFakeUsers(counts.orders, ROLES.USER);
    const fakeOrders = this.buildFakeOrders(counts.orders, fakeUsers);
    const fakeAgents = this.buildFakeUsers(counts.deliveryAgents, ROLES.DELIVERY);
    return this.buildFakeDeliveries(counts.deliveries, fakeOrders, fakeAgents);
  }

  generatePreview(rawCounts) {
    const counts = resolveCounts(rawCounts);
    assertRelations(counts);

    const fakeUsers = this.buildFakeUsers(counts.users, ROLES.USER);
    const fakeAgents = this.buildFakeUsers(counts.deliveryAgents, ROLES.DELIVERY);
    const fakeOrders = counts.orders > 0 ? this.buildFakeOrders(counts.orders, fakeUsers) : [];
    const fakeDeliveries = counts.deliveries > 0
      ? this.buildFakeDeliveries(counts.deliveries, fakeOrders, fakeAgents)
      : [];

    return { users: fakeUsers, deliveryAgents: fakeAgents, orders: fakeOrders, deliveries: fakeDeliveries };
  }

  async insertMockData(rawCounts) {
    const counts = resolveCounts(rawCounts);
    assertRelations(counts);

    const rawUsers = this.buildFakeUsers(counts.users, ROLES.USER);
    const rawAgents = this.buildFakeUsers(counts.deliveryAgents, ROLES.DELIVERY);

    const hashedPeople = [...rawUsers, ...rawAgents].map((person) => ({
      ...person,
      password: bcrypt.hashSync(person.password, 10),
    }));

    let insertedPeople;
    try {
      insertedPeople = hashedPeople.length > 0 ? await userRepository.createMany(hashedPeople) : [];
    } catch (error) {
      throw new MockGenerationError(error);
    }

    const insertedUsers = insertedPeople.filter((person) => person.role === ROLES.USER);
    const insertedAgents = insertedPeople.filter((person) => person.role === ROLES.DELIVERY);

    const rawOrders = counts.orders > 0 ? this.buildFakeOrders(counts.orders, insertedUsers) : [];
    let insertedOrders;
    try {
      insertedOrders = rawOrders.length > 0 ? await orderRepository.createMany(rawOrders) : [];
    } catch (error) {
      throw new MockGenerationError(error);
    }

    const rawDeliveries = counts.deliveries > 0
      ? this.buildFakeDeliveries(counts.deliveries, insertedOrders, insertedAgents)
      : [];
    let insertedDeliveries;
    try {
      insertedDeliveries = rawDeliveries.length > 0 ? await deliveryRepository.createMany(rawDeliveries) : [];
    } catch (error) {
      throw new MockGenerationError(error);
    }

    const summary = {
      users: insertedUsers.length,
      deliveryAgents: insertedAgents.length,
      orders: insertedOrders.length,
      deliveries: insertedDeliveries.length,
    };

    logger.info(
      `Datos de prueba generados: usuarios=${summary.users}, repartidores=${summary.deliveryAgents}, ` +
      `pedidos=${summary.orders}, entregas=${summary.deliveries}`
    );

    return summary;
  }
}

module.exports = new MockService();
