const Router = require('express').Router;
const Controller = require('../Controllers/user');
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../Middlewares/auth');

// TODO: разделить на my и all
router.get('/all', authMiddleware, Controller.getAll);

router.post(
	'/',
	body('name').isLength({ min: 1, max: 255 }),
	body('vkID').isInt(),
	body('surname').isLength({ min: 1, max: 255 }),
	body('regionID').optional().isInt({ min: 0, max: 150 }),
	body('allowedRegions').optional(),
	body('status').optional(),
	authMiddleware,
	Controller.create
);

router.put('/:id', authMiddleware, Controller.update);

module.exports = router;
