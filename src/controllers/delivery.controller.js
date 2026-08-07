const deliveryService = require('../services/delivery.service');
const catchAsync = require('../utils/catchAsync');
const { FileRequiredError } = require('../errors');
const { DELIVERY_VOUCHER_FIELD } = require('../uploads/multer.config');

class DeliveryController {
  getAll = catchAsync(async (req, res) => {
    const deliveries = await deliveryService.getAllDeliveries();
    res.status(200).json({ status: 'success', payload: deliveries });
  });

  getById = catchAsync(async (req, res) => {
    const delivery = await deliveryService.getDeliveryById(req.params.did);
    res.status(200).json({ status: 'success', payload: delivery });
  });

  create = catchAsync(async (req, res) => {
    const delivery = await deliveryService.createDelivery(req.body);
    res.status(201).json({ status: 'success', payload: delivery });
  });

  updateStatus = catchAsync(async (req, res) => {
    const delivery = await deliveryService.updateDeliveryStatus(req.params.did, req.body.status);
    res.status(200).json({ status: 'success', payload: delivery });
  });

  uploadVoucher = catchAsync(async (req, res) => {
    if (!req.file) {
      throw new FileRequiredError(DELIVERY_VOUCHER_FIELD);
    }

    const delivery = await deliveryService.addVoucher(req.params.did, req.file, req.body.voucherType);
    res.status(201).json({ status: 'success', payload: delivery });
  });
}

module.exports = new DeliveryController();
