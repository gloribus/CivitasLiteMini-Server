const Service = require('../Services/participant');

class ParticipantController {
	async getAll (req, res) {
		try {
			const condition = { regionID: req.user.userRegionID };
			const data = await Service.getAll(condition);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getRegionStats (req, res) {
		try {
			let district = [];
			if (req.user.userStatus == "coordinator") {
				district = req.user.userAllowedRegions;
			}
			const data = await Service.getRegionStats(req.user.userRegionID, district);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getAllStats (req, res, next) {
		try {
			const data = await Service.getAllStats();
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new ParticipantController();
