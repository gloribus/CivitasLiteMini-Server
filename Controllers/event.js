const modelName = 'event';
const Service = require('../Services/' + modelName);
const ParticipantService = require('../Services/marafonParticipant');
const Log = require('../Utils/log');
const ApiError = require('../Utils/api-error');

const { validationResult } = require('express-validator');

class EventController {
	async getMy(req, res, next) {
		try {
			const condition = { userID: req.user.userID };
			const data = await Service.get(condition);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async get(req, res, next) {
		try {
			let include = [];
			if (req.baseUrl == '/public') {
				include = ['regionID', 'locality', 'school'];
			}
			const condition = { id: req.params.id };
			const data = await Service.get(condition, include);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	/* 	async getByID(req, res, next) {
		try {
			let include = [];
			if (req.baseUrl == '/public') {
				include = ['regionID', 'locality', 'school'];
			}
			const condition = { id: req.params.id };
			let data = await Service.get(condition, include);
			const participants = await ParticipantService.getAll(
				{ eventID: req.params.id },
				['uuid', 'name', 'surname']
			);

			console.log(data[0].event.dataValues);
			console.log(participants);
			//data.team = participants;
			data.team = [12, 41];
			console.log(data);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	} */

	async create(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return next(
					ApiError.BadRequest(
						'Ошибка при валидации данных',
						errors.array()
					)
				);
			}

			req.body.regionID = req.user.userRegionID;
			req.body.userID = req.user.userID;
			const create = await Service.create(req.body);
			let success = true;
			if (!create || create.length === 0) {
				success = false;
			}

			return res.json({ success, data: create });
		} catch (e) {
			next(e);
		}
	}

	/* 	async update(req, res, next) {
		try {
			const condition = { userID: req.user.userID };
			const isUpdated = await Service.update(
				req.body,
				req.params.id,
				condition
			);

			Log.add({
				userID: req.user.userID,
				action: 'update',
				newValue: req.body,
				aimModel: modelName,
				aimID: req.params.id,
			});

			return res.json({ success: Boolean(Number(isUpdated)) });
		} catch (e) {
			next(e);
		}
	} */

	/* 	async delete(req, res, next) {
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
				aimModel: modelName,
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
	} */
}

module.exports = new EventController();
