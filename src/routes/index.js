const { Router } = require('express');
const productRoutes = require('./product.routes');
const userRoutes = require('./user.routes');
const mockRoutes = require('./mock.routes');
const logRoutes = require('./log.routes');

const router = Router();

router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/mocks', mockRoutes);
router.use('/logs', logRoutes);

module.exports = router;
