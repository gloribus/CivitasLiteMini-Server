const Router = require('express').Router;
const Controller = require('../Controllers/handler');
const router = new Router();
//const { body } = require('express-validator');

router.post(
	'/registration',
	// body('invitedBy').isUUID(1).optional(),
	// body('name').isLength({ min: 1, max: 255 }),
	// body('surname').isLength({ min: 1, max: 255 }),
	// body('patronymic').isLength({ min: 1, max: 255 }).optional(),
	// body('birthday').isISO8601().toDate(),
	// body('login').isLength({ min: 3, max: 32 }).isAlphanumeric().optional(),
	// body('password').isLength({ min: 7, max: 64 }).optional(),
	Controller.registration
);

/*
router.get('/registration', function (req, res) {
	console.log(2);
	res.send('ok');
});
*/

module.exports = router;
