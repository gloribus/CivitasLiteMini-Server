const Service = require('../Services/marafonParticipant');
const ApiError = require('../Utils/api-error');
const EventService = require('../Services/event');

class MarafonParticipantController {
	async getAll(req, res) {
		try {
			const condition = { regionID: req.user.userRegionID };
			const data = await Service.getAll(condition);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getByRegion(req, res, next) {
		try {
			if (req.user.userStatus === 'active') {
				req.params.id = req.user.userRegionID;
			}

			if (req.user.userStatus === 'coordinator') {
				if (
					!req.user.userAllowedRegions.includes(
						parseInt(req.params.id)
					)
				) {
					return next(
						ApiError.Forbidden(`У тебя нет доступа к этому региону`)
					);
				}
			}

			let condition = {};
			if (req.user.userStatus === 'active') {
				const events = [];
				const userEvents = await EventService.get(
					{ userID: req.user.userID },
					['id']
				);

				userEvents.map((event) => {
					events.push(event.id);
				});

				condition = { eventID: events };
			} else {
				condition = { regionID: req.params.id };
			}

			const data = await Service.getAll(condition);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getByEvent(req, res) {
		try {
			const condition = { eventID: req.params.id };
			const data = await Service.getAll(condition, [
				'uuid',
				'name',
				'surname',
			]);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getByIdea(req, res) {
		try {
			const condition = { ideaID: req.params.id };
			const data = await Service.getAll(condition, [
				'uuid',
				'name',
				'surname',
				'locality',
				'school',
				'grade',
				'vkID',
				'telephone',
			]);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getRegionStats(req, res) {
		try {
			let district = [];
			if (req.user.userStatus == 'coordinator') {
				district = req.user.userAllowedRegions;
			}
			const data = await Service.getRegionStats(
				req.user.userRegionID,
				district
			);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getAllStats(req, res, next) {
		try {
			const data = await Service.getAllStats();
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new MarafonParticipantController();
