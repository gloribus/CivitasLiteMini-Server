const Model = require('../Models').team;
const ApiError = require('../Utils/api-error');
const allowedProperties = require('../Utils/allowed-properties');

class TeamService {
	async getAll(condition) {
		const exclude = ['createdAt', 'updatedAt', 'isDeleted'];
		const baseCondition = { isDeleted: false };
		const finalCondition = { ...condition, ...baseCondition };

		const data = await Model.findAll({
			where: finalCondition,
			attributes: { exclude },
			order: [['createdAt', 'DESC']]
		});

		return data;
	}

	async create(team) {
		let data = allowedProperties(team, [
			'regionID',
			'universityName',
			'facultyName',
			'name',
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

		console.log(isDeleted);

		return isDeleted;
	}
}

module.exports = new TeamService();
