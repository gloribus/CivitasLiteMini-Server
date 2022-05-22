const Router = require('express').Router;
const Controller = require('../Controllers/event');
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../Middlewares/auth');

router.get('/my', authMiddleware, Controller.getMy);

router.post(
	'/',
	body('locality').isLength({ min: 1, max: 255 }),
	body('school').isLength({ min: 1, max: 255 }),
	authMiddleware,
	Controller.create
);

//router.put('/:id', authMiddleware, Controller.update);

module.exports = router;
