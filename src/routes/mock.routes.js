const { Router } = require('express');
const mockController = require('../controllers/mock.controller');

const router = Router();

router.get('/users', mockController.previewUsers);
router.get('/delivery-agents', mockController.previewDeliveryAgents);
router.get('/orders', mockController.previewOrders);
router.get('/deliveries', mockController.previewDeliveries);
router.get('/preview', mockController.previewAll);
router.post('/generate', mockController.generate);

module.exports = router;
