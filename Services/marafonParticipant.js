const Model = require('../Models').marafonParticipant;
/* const TeamModel = require('../Models').team; */
const ApiError = require('../Utils/api-error');
const allowedProperties = require('../Utils/allowed-properties');
const NodeCache = require('node-cache');
/* const cache = new NodeCache(); */

class MarafonParticipantService {
	async getAll(condition, include = []) {
		const exclude = ['createdAt', 'updatedAt', 'isDeleted'];
		const baseCondition = { isDeleted: false };
		const finalCondition = { ...condition, ...baseCondition };

		let attributes;
		if (include && include.length > 0) {
			attributes = include;
		} else {
			attributes = { exclude };
		}

		const data = await Model.findAll({
			where: finalCondition,
			attributes,
		});

		return data;
	}

	async create(participant, onlyID = true) {
		let data = allowedProperties(participant, [
			'name',
			'surname',
			'telephone',
			'vkID',
			'regionID',
			'locality',
			'school',
			'grade',
			'eventID',
		]);

		try {
			const created = await Model.create(data);
			if (onlyID) {
				return created.uuid;
			} else {
				return created;
			}
		} catch (e) {
			throw ApiError.DBError(e);
		}
	}

	async delete(id) {
		if (!id) {
			throw ApiError.BadRequest('Не указан ID');
		}

		const isDeleted = await Model.update(
			{ isDeleted: 1 },
			{
				where: { teamID: id },
			}
		);

		return isDeleted;
	}

	async update(data, uuid, condition) {
		if (!uuid) {
			throw ApiError.BadRequest('Не указан ID');
		}

		let allowedData = allowedProperties(data, ['ideaID']);

		const baseCondition = { uuid };
		const finalCondition = { ...condition, ...baseCondition };
		const isUpdated = await Model.update(allowedData, {
			where: finalCondition,
		});

		return isUpdated;
	}

	async abort(id) {
		if (!id) {
			throw ApiError.BadRequest('Не указан ID');
		}

		const isDeleted = await Model.destroy({
			where: { uuid: id },
		});

		return isDeleted;
	}

	async getStats() {
		const CNT = await Model.count({
			attributes: ['regionID'],
			group: 'regionID',
			where: { isDeleted: 0 },
			distinct: true,
			col: 'vkID',
		});

		return CNT;
	}
}

module.exports = new MarafonParticipantService();
