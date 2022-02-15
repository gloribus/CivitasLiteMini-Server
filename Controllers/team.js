const Service = require('../Services/team');
const Log = require('../Utils/log');

class TeamController {
	async getAll(req, res, next) {
		try {
			const condition = { regionID: req.user.userRegionID };
			const data = await Service.getAll(condition);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async update(req, res, next) {
		try {
			const condition = { regionID: req.user.userRegionID };
			const isUpdated = await Service.update(
				req.body,
				req.params.id,
				condition
			);

			Log.add({
				userID: req.user.userID,
				action: 'update',
				newValue: req.body,
				aimModel: 'team',
				aimID: req.params.id,
			});

			return res.json({ success: Boolean(Number(isUpdated)) });
		} catch (e) {
			next(e);
		}
	}

	async delete(req, res, next) {
		try {
			const condition = { regionID: req.user.userRegionID };
			const ParticipantService = require('../Services/participant');
			const isDeletedTeam = await Service.delete(
				req.params.id,
				condition
			);
			const isDeletedParticipants = await ParticipantService.delete(
				req.params.id
			);

			Log.add({
				userID: req.user.userID,
				action: 'delete',
				aimModel: 'team',
				aimID: req.params.id,
			});

			return res.json({
				success: Boolean(
					Number(isDeletedTeam) && Number(isDeletedParticipants)
				),
				team: Boolean(Number(isDeletedTeam)),
				participants: Boolean(Number(isDeletedParticipants)),
			});
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new TeamController();
