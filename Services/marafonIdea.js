const Model = require('../Models').marafonIdea;
/* const TeamModel = require('../Models').team; */
const ApiError = require('../Utils/api-error');
const allowedProperties = require('../Utils/allowed-properties');
const NodeCache = require('node-cache');
/* const cache = new NodeCache(); */

class MarafonIdeaService {
	async getAll(condition) {
		const exclude = ['createdAt', 'updatedAt', 'isDeleted'];
		const baseCondition = { isDeleted: false };
		const finalCondition = { ...condition, ...baseCondition };

		const data = await Model.findAll({
			where: finalCondition,
			attributes: { exclude },
		});

		return data;
	}

	async create(participant) {
		let data = allowedProperties(participant, [
			'title',
			'description',
			'problem',
			'attracting',
			'audience',
			'resources',
			'regionID',
			'steps',
			'eventID',
		]);

		try {
			const created = await Model.create(data);
			return created.uuid;
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
		});

		return CNT;
	}
}

module.exports = new MarafonIdeaService();
