const Router = require('express').Router;
const Controller = require('../Controllers/marafonParticipant');
const router = new Router();
const authMiddleware = require('../Middlewares/auth');

router.get('/all', authMiddleware, Controller.getAll);
/* router.get('/stats', authMiddleware, Controller.getRegionStats);
router.get('/stats/all', Controller.getAllStats); */
module.exports = router;
