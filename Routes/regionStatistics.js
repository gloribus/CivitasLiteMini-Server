const Router = require('express').Router;
const Controller = require('../Controllers/regionStatistics');
const router = new Router();
const authMiddleware = require('../Middlewares/auth');

//router.get('/user/:id', authMiddleware, Controller.getUserStat);
router.get('/all', authMiddleware, Controller.getAll);
router.patch('/init/asd1@31413da', authMiddleware, Controller.init);
router.patch('/update', authMiddleware, Controller.update);
router.get('/leaderboard', Controller.publicGetAll);
module.exports = router;
