const Model = require('../Models').participant;
const TeamModel = require('../Models').team;
const ApiError = require('../Utils/api-error');
const allowedProperties = require('../Utils/allowed-properties');
const NodeCache = require("node-cache");
const cache = new NodeCache();

class ParticipantService {
	async getAll (condition) {
		const exclude = ['createdAt', 'updatedAt', 'isDeleted'];
		const baseCondition = { isDeleted: false };
		const finalCondition = { ...condition, ...baseCondition };

		const data = await Model.findAll({
			where: finalCondition,
			attributes: { exclude },
		});

		return data;
	}

	async create (participant) {
		let data = allowedProperties(participant, [
			'name',
			'surname',
			'birthday',
			'telephone',
			'socialLink',
			'regionID',
			'teamName',
			'teamID',
			'universityName',
			'facultyName',
		]);

		try {
			const created = await Model.create(data);
			return created.uuid;
		} catch (e) {
			throw ApiError.DBError(e);
		}
	}

	async delete (id) {
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

	async getAllStats () {
		let cacheData = cache.get("allStats");
		if (cacheData) {
			return cacheData;
		} else {
			const ListQuantity = await Model.count({
				attributes: ['regionID'],
				group: 'regionID',
				where: { isDeleted: 0 },
			});

			const rankedListQuantity = ListQuantity.slice().sort(
				(a, b) => b.count - a.count
			);

			cache.set("allStats", rankedListQuantity, 60 * 5);

			return rankedListQuantity;
		}
	}

	async getRegionStats (regionID, district = []) {
		/* 		let cacheData = cache.get( "regionStats" );
				if(cacheData) {
					return cacheData;
				} else { */
		let universitiesQuantity = await Model.count({
			distinct: true,
			col: ['universityName'],
			where: { regionID, isDeleted: 0 },
		});

		// Допущение 
		// TODO: Вынести в отдельную статистику
		let teamsQuantity = await TeamModel.count({
			col: ['uuid'],
			where: { regionID, isDeleted: 0 },
		});

		let participantsQuantity = await Model.count({
			where: { regionID, isDeleted: 0 },
		});

		const ListQuantity = await Model.count({
			attributes: ['regionID'],
			group: 'regionID',
			where: { isDeleted: 0 },
		});

		const rankedListQuantity = ListQuantity.slice().sort(
			(a, b) => b.count - a.count
		);

		let regionRank = 0;
		for (let i = 0; i < rankedListQuantity.length; i++) {
			if (rankedListQuantity[i].regionID === regionID) {
				regionRank = i + 1;
				break;
			}
		}

		if (Array.isArray(district) && district.length > 1) {
			participantsQuantity +=
				' (' +
				(await Model.count({
					where: { regionID: district, isDeleted: 0 },
				})) + ')';
			teamsQuantity +=
				' (' +
				(await TeamModel.count({
					col: ['uuid'],
					where: { regionID: district, isDeleted: 0 },
				})) + ')';
			universitiesQuantity +=
				' (' +
				(await Model.count({
					distinct: true,
					col: ['universityName'],
					where: { regionID: district, isDeleted: 0 },
				})) + ')';
		}

		const data = [
			{ title: 'Всего участников', value: participantsQuantity },
			{ title: 'Место в общем рейтинге', value: regionRank },
			{ title: 'Всего команд', value: teamsQuantity },
			{ title: 'Всего университетов', value: universitiesQuantity },
		];

		//cache.set( "regionStats", data, 60 );

		return data;
		/* 		} */
	}
}

module.exports = new ParticipantService();
