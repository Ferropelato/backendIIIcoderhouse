const { Router } = require('express');
const logController = require('../controllers/log.controller');

const router = Router();

router.get('/test', logController.testLevels);

module.exports = router;
