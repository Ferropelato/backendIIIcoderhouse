const { Router } = require('express');
const productController = require('../controllers/product.controller');

const router = Router();

router.get('/', productController.getAll);
router.get('/:pid', productController.getById);
router.post('/', productController.create);
router.put('/:pid', productController.update);
router.delete('/:pid', productController.delete);

module.exports = router;
