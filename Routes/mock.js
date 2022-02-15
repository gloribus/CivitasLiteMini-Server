const Router = require('express').Router;
const Controller = require('../Controllers/mock');
const router = new Router();
const authMiddleware = require('../Middlewares/auth');
/* const { body } = require('express-validator'); */

router.patch(
	'/fill/teams-participants/random',
	authMiddleware,
	Controller.fillTeamsParticipantsRandom
);
//router.post('/login', AuthController.login);

module.exports = router;
