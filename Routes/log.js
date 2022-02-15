const Router = require('express').Router;
const Controller = require('../Controllers/log');
const router = new Router();
const authMiddleware = require('../Middlewares/auth');
/* const { body } = require('express-validator'); */

router.post('/', authMiddleware, Controller.log);
//router.post('/login', AuthController.login);

module.exports = router;
