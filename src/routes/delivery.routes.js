const { Router } = require('express');
const deliveryController = require('../controllers/delivery.controller');

const router = Router();

router.get('/', deliveryController.getAll);
router.get('/:did', deliveryController.getById);
router.post('/', deliveryController.create);
router.patch('/:did/status', deliveryController.updateStatus);

module.exports = router;
