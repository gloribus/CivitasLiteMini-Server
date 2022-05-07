const Router = require('express').Router;
const Controller = require('../Controllers/user');
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../Middlewares/auth');

router.get('/all', authMiddleware, Controller.getAll);

/* router.post('/', function(req, res) {
  body('invitedBy').isLength(36),
  authMiddleware,
  Controller.create
}); */

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

/* router.post('/', 
    body('login').isLength({min: 3, max: 32}).isAlphanumeric(),
    body('password').isLength({min: 7, max: 64}),
    Controller.create
);
 */

module.exports = router;
