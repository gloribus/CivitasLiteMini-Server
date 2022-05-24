const Router = require('express').Router;
const Controller = require('../Controllers/marafonIdea');
const router = new Router();
const authMiddleware = require('../Middlewares/auth');

router.get('/all', authMiddleware, Controller.get);
router.get('/count', authMiddleware, Controller.count);
router.get('/:id', authMiddleware, Controller.getById);
/* router.get('/stats', authMiddleware, Controller.getRegionStats);
router.get('/stats/all', Controller.getAllStats); */
module.exports = router;
