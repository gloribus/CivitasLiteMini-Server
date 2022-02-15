const Router = require('express').Router;
const Controller = require('../Controllers/team');
const router = new Router();
const authMiddleware = require('../Middlewares/auth');

router.get('/all', authMiddleware, Controller.getAll);
router.put('/:id', authMiddleware, Controller.update);
router.delete('/:id', authMiddleware, Controller.delete);

module.exports = router;
