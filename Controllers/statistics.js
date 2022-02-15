const Service = require('../Services/statistics');
const TeamService = require('../Services/participant');

class StatisticsController {
	async getAll(req, res, next) {
		try {
			const data = await Service.getAll();
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getMyRegion(req, res, next) {
		try {
			const data = await Service.getByRegionID(req.user.userRegionID);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async recalculation(req, res, next) {
		try {
			const data = await TeamService.getRegionStats(14);
			const data = await TeamService.getAllStats();
			return res.json(data);

			/* 			if(req.user.Sta)


			const condition = { regionID: req.user.userRegionID };
			
			return res.json(data); */
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new StatisticsController();
