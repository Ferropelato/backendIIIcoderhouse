const { Router } = require('express');
const deliveryController = require('../controllers/delivery.controller');
const { deliveryVouchersUpload, DELIVERY_VOUCHER_FIELD } = require('../uploads/multer.config');

const router = Router();

router.get('/', deliveryController.getAll);
router.get('/:did', deliveryController.getById);
router.post('/', deliveryController.create);
router.patch('/:did/status', deliveryController.updateStatus);
router.post('/:did/voucher', deliveryVouchersUpload.single(DELIVERY_VOUCHER_FIELD), deliveryController.uploadVoucher);

module.exports = router;
