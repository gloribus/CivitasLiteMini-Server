const Service = require('../Services/marafonIdea');
const UserService = require('../Services/user');
const EventService = require('../Services/event');
const ApiError = require('../Utils/api-error');

class MarafonIdeaController {
	async get(req, res, next) {
		try {
			const page = req.query.page || 1;
			let condition = {};

			if (req.user.userStatus === 'active') {
				req.query.user = req.user.userID;
				req.query.region = req.user.userRegionID;
			}
			if (req.query.region) {
				if (req.query.user) {
					const events = [];
					const userEvents = await EventService.get(
						{ userID: req.query.user },
						['id']
					);

					userEvents.map((event) => {
						events.push(event.id);
					});

					condition = { regionID: req.query.region, eventID: events };
				} else {
					condition = { regionID: req.query.region };
				}
			} else {
				if (req.user.userStatus === 'coordinator') {
					condition = { regionID: req.user.userAllowedRegions };
				} else {
					condition = {};
				}
			}

			const data = await Service.getAll(condition, [], 6, (page - 1) * 6);
			return res.json(data);

			//return res.json(123);
		} catch (e) {
			next(e);
		}
	}

	async getById(req, res, next) {
		try {
			// Проверка прав

			const data = await Service.getAll({ uuid: req.params.id }, [], 1);
			return res.json(data);

			//return res.json(123);
		} catch (e) {
			next(e);
		}
	}

	async count(req, res, next) {
		try {
			let condition = {};

			if (req.user.userStatus === 'active') {
				req.query.user = req.user.userID;
				req.query.region = req.user.userRegionID;
			}

			if (req.query.region) {
				if (req.query.user) {
					const events = [];
					const userEvents = await EventService.get(
						{ userID: req.query.user },
						['id']
					);

					userEvents.map((event) => {
						events.push(event.id);
					});

					condition = { regionID: req.query.region, eventID: events };
				} else {
					condition = { regionID: req.query.region };
				}
			} else {
				if (req.user.userStatus === 'coordinator') {
					condition = { regionID: req.user.userAllowedRegions };
				} else {
					condition = {};
				}
			}
			const data = await Service.count(condition);
			return res.json(data);

			//return res.json(123);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new MarafonIdeaController();
