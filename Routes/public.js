const Router = require('express').Router;
const StatsController = require('../Controllers/stats');
const EventController = require('../Controllers/event');
const StatisticsController = require('../Controllers/regionStatistics');
const MarafonParticipantController = require('../Controllers/marafonParticipant');
const router = new Router();

router.get('/stats/leaderboard/global', StatsController.getLeaderboardGlobal);
router.get('/stats/leaderboard/:id', StatsController.getLeaderboardByRegion);
router.get('/stats/general', StatsController.getGeneral);
router.get('/event/:id/general', EventController.get);
router.get('/event/:id/participants', MarafonParticipantController.getByEvent);

module.exports = router;
