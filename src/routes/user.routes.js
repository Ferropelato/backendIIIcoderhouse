const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { userDocumentsUpload, USER_DOCUMENT_FIELD } = require('../uploads/multer.config');

const router = Router();

router.get('/', userController.getAll);
router.get('/:uid', userController.getById);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/:uid/role', userController.updateRole);
router.post('/:uid/documents', userDocumentsUpload.single(USER_DOCUMENT_FIELD), userController.uploadDocument);

module.exports = router;
