const Router = require('express').Router;
const Controller = require('../Controllers/statistics');
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../Middlewares/auth');

router.get('/all', authMiddleware, Controller.getAll);
router.get('/recalculation', authMiddleware, Controller.recalculation);
router.get('/myRegion', authMiddleware, Controller.getMyRegion);

/* router.post('/', function(req, res) {
  body('invitedBy').isLength(36),
  authMiddleware,
  UserController.create
}); */

/* router.post(
	'/',
	body('invitedBy').isUUID(1).optional(),
	body('name').isLength({ min: 1, max: 255 }),
	body('surname').isLength({ min: 1, max: 255 }),
	body('patronymic').isLength({ min: 1, max: 255 }).optional(),
	body('birthday').isISO8601().toDate(),
	body('login').isLength({ min: 3, max: 32 }).isAlphanumeric().optional(),
	body('password').isLength({ min: 7, max: 64 }).optional(),
	authMiddleware,
	UserController.create
); */

/* router.post('/', 
    body('login').isLength({min: 3, max: 32}).isAlphanumeric(),
    body('password').isLength({min: 7, max: 64}),
    UserController.create
);
 */

module.exports = router;
