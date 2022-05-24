const Router = require('express').Router;
const Controller = require('../Controllers/user');
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../Middlewares/auth');

router.get('/all', authMiddleware, Controller.getAll);
router.get('/region/:id', authMiddleware, Controller.getByRegion);
router.get('/stats/:id', authMiddleware, Controller.getStats);
router.get('/agregation', authMiddleware, Controller.getAgregation);
router.get('/:id', authMiddleware, Controller.getByID);
router.patch('/actualize', authMiddleware, Controller.actualize);

router.post(
	'/',
	body('name').isLength({ min: 1, max: 255 }),
	body('status').isLength({ min: 1, max: 255 }),
	body('surname').isLength({ min: 1, max: 255 }),
	body('birthday').toDate(),
	body('regionID').isInt({ min: 0, max: 150 }),
	body('allowedRegions').optional(),
	body('status').optional(),
	authMiddleware,
	Controller.create
);
router.put('/:id', authMiddleware, Controller.update);

module.exports = router;
