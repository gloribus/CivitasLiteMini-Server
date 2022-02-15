const TeamModel = require('../Models').team;
const ParticipantModel = require('../Models').participant;
const { Op } = require("sequelize");
//const ApiError = require('../Utils/api-error');
const NodeCache = require('node-cache');
const cache = new NodeCache();

class TeamService {
	async getLeaderboard({ limit, regionID }) {
		const cacheKey =
			'leaderboard_' + Object.entries(arguments[0]).toString();
		const cacheData = cache.get(cacheKey);
		if (cacheData) {
			return cacheData;
		} else {
			const attributes = ['name', 'regionID', 'universityName', 'score'];
			const finalCondition = {
				isDeleted: false,
				score: {[Op.gt]: 0}
			};
			if (regionID) {
				finalCondition['regionID'] = regionID;
			}

			const data = await TeamModel.findAll({
				where: finalCondition,
				attributes,
				limit,
				order: [['score', 'DESC']],
			});

			cache.set(cacheKey, data, 60 * 30);
			return data;
		}
	}

	async getGeneral() {
		const cacheKey = 'general';
		const cacheData = cache.get(cacheKey);
		if (cacheData) {
			return cacheData;
		} else {
			const universitiesQuantity = await ParticipantModel.count({
				distinct: true,
				col: ['universityName'],
				where: { isDeleted: 0 },
			});

			const participantsQuantity = await ParticipantModel.count({
				where: { isDeleted: 0 },
			});

			const teamsQuantity = await TeamModel.count({
				col: ['uuid'],
				where: { isDeleted: 0 },
			});

			const data = {
				participantsQuantity,
				teamsQuantity,
				universitiesQuantity,
			};
			cache.set(cacheKey, data, 60 * 30);
			return data;
		}
	}
}

module.exports = new TeamService();
