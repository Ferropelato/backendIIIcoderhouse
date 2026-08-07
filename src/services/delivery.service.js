const deliveryRepository = require('../repositories/delivery.repository');
const orderRepository = require('../repositories/order.repository');
const userRepository = require('../repositories/user.repository');
const { ROLES, DELIVERY_STATUS, VOUCHER_TYPES } = require('../constants');
const {
  DeliveryNotFoundError,
  OrderNotFoundError,
  InvalidDeliveryAgentError,
  InvalidStatusError,
  InvalidDocumentTypeError,
  FileUploadError,
} = require('../errors');
const { toRelativePath } = require('../uploads/paths');
const removeFileIfExists = require('../utils/removeFileIfExists');
const logger = require('../logger');

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

  async addVoucher(deliveryId, file, voucherType) {
    try {
      const type = voucherType || VOUCHER_TYPES.DELIVERY_PROOF;
      if (!Object.values(VOUCHER_TYPES).includes(type)) {
        throw new InvalidDocumentTypeError(type, Object.values(VOUCHER_TYPES));
      }

      const delivery = await deliveryRepository.getById(deliveryId);
      if (!delivery) {
        throw new DeliveryNotFoundError(deliveryId);
      }

      const voucherMetadata = {
        originalName: file.originalname,
        storedName: file.filename,
        path: toRelativePath(file.path),
        mimeType: file.mimetype,
        size: file.size,
        documentType: type,
      };

      let updatedDelivery;
      try {
        updatedDelivery = await deliveryRepository.addVoucher(deliveryId, voucherMetadata);
      } catch (dbError) {
        throw new FileUploadError(dbError);
      }

      logger.info(
        `Comprobante asociado correctamente a la entrega: entrega=${deliveryId}, tipo=${type}, archivo=${file.filename}`
      );

      return updatedDelivery;
    } catch (error) {
      await removeFileIfExists(file.path);
      throw error;
    }
  }
}

module.exports = new DeliveryService();
