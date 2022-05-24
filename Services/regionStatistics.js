const Model = require('../Models').regionStatistics;
const ApiError = require('../Utils/api-error');
const allowedProperties = require('../Utils/allowed-properties');
const regions = require('../Utils/regionList');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

class RegionStatisticsService {
	async get(condition, include = [], order = ['participantsCNT', 'DESC']) {
		const exclude = ['createdAt'];
		const finalCondition = { ...condition };

		let attributes;
		if (include && include.length > 0) {
			attributes = include;
		} else {
			attributes = { exclude };
		}

		const data = await Model.findAll({
			where: finalCondition,
			attributes,
			order: [order],
		});

		return data;
	}

	async sum(condition) {
		const data = await Model.findAll({
			where: condition,
			attributes: [
				[
					sequelize.fn('sum', sequelize.col('participantsCNT')),
					'participantsCNT',
				],
				[sequelize.fn('sum', sequelize.col('ideasCNT')), 'ideasCNT'],
				[sequelize.fn('sum', sequelize.col('eventsCNT')), 'eventsCNT'],
			],
			/* 	order: [order], */
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

	async updateStats(id, aim, value) {
		if (!id) {
			throw ApiError.BadRequest('Не указан ID');
		}

		if (!aim || !value) {
			throw ApiError.BadRequest('Не указаны данные для обновления');
		}

		if (!['participantsCNT', 'ideasCNT', 'eventsCNT'].includes(aim)) {
			throw ApiError.BadRequest('Неверное значение aim');
		}
		const isUpdated = await Model.increment(aim, {
			by: value,
			where: { regionID: id },
		});

		return Boolean(isUpdated[0][1]);
	}

	async init() {
		return await Model.bulkCreate(regions, {
			ignoreDuplicates: true,
			logging: false,
		});
	}

	async update(data, id) {
		if (!id) {
			throw ApiError.BadRequest('Не указан ID');
		}

		const isUpdated = await Model.update(data, {
			where: { regionID: id },
			logging: false,
		});

		return isUpdated;
	}
}

module.exports = new RegionStatisticsService();
