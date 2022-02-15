const Service = require('../Services/stats');

class StatsController {
	async getLeaderboardGlobal(req, res, next) {
		try {
			const data = await Service.getLeaderboard({
				limit: 20,
			});
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getLeaderboardByRegion(req, res, next) {
		try {
			const data = await Service.getLeaderboard({
				limit: 20,
				regionID: req.params.id,
			});
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getGeneral(req, res, next) {
		try {
			const data = await Service.getGeneral();
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new StatsController();
