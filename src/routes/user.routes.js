const { Router } = require('express');
const userController = require('../controllers/user.controller');

const router = Router();

router.get('/', userController.getAll);
router.get('/:uid', userController.getById);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/:uid/role', userController.updateRole);

module.exports = router;
