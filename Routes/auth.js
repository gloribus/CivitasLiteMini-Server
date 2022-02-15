const Router = require('express').Router;
const AuthController = require('../Controllers/auth');
const router = new Router();
const { body } = require('express-validator');

router.post('/login/vk', AuthController.loginByVK);
//router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/refresh', AuthController.refresh);

module.exports = router;
