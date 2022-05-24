const Router = require('express').Router;
const Controller = require('../Controllers/marafonParticipant');
const router = new Router();
const authMiddleware = require('../Middlewares/auth');

router.get('/all', authMiddleware, Controller.getAll);
router.get('/idea/:id', authMiddleware, Controller.getByIdea);
router.get('/region/:id', authMiddleware, Controller.getByRegion);
//router.get('/stats/all', Controller.getAllStats);
module.exports = router;
