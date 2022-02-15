const Model = require('../Models').statistics;
const ApiError = require('../Utils/api-error');
const allowedProperties = require('../Utils/allowed-properties');

class StatisticsService {
	async getAll() {
		const exclude = ['createdAt', 'updatedAt', 'ratingPlace'];

		const data = await Model.findAll({
			attributes: { exclude },
			order: [['participantsQuantity', 'DESC']],
		});

		return data;
	}

	async getByRegionID(regionID) {
		const exclude = ['createdAt', 'updatedAt'];

		const data = await Model.findOne({
			where: { regionID },
			attributes: { exclude },
		});

		return data;
	}

	async recalculation(regionID) {
		// Получить из Teams
		// Получить из Participants

		return data;
	}

	async create(user) {
		let data = allowedProperties(user, [
			'name',
			'regionID',
			'universityName',
			'facultyName',
			'membersQuantity',
		]);

		try {
			const created = await Model.create(data);
			return created.uuid;
		} catch (e) {
			throw ApiError.DBError(e);
		}
	}

	async update(data, id, condition) {
		if (!id) {
			throw ApiError.BadRequest('Не указан ID');
		}

		let allowedData = allowedProperties(data, ['score']);

		const baseCondition = { uuid: id };
		const finalCondition = { ...condition, ...baseCondition };

		const isUpdated = await Model.update(allowedData, {
			where: finalCondition,
		});

		return isUpdated;
	}

	async delete(id, condition) {
		if (!id) {
			throw ApiError.BadRequest('Не указан ID');
		}

		const baseCondition = { uuid: id };
		const finalCondition = { ...condition, ...baseCondition };

		const isDeleted = await Model.update(
			{ isDeleted: 1 },
			{
				where: finalCondition,
			}
		);

		return isDeleted;
	}
}

module.exports = new StatisticsService();
