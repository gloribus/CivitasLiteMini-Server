const Router = require('express').Router;
const StatsController = require('../Controllers/stats');
const router = new Router();

router.get('/stats/leaderboard/global', StatsController.getLeaderboardGlobal);
router.get('/stats/leaderboard/:id', StatsController.getLeaderboardByRegion);
router.get('/stats/general', StatsController.getGeneral);

module.exports = router;
