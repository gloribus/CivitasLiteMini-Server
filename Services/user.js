const Model = require('../Models').user;
const ApiError = require('../Utils/api-error');
const allowedProperties = require('../Utils/allowed-properties');
const { Op } = require('sequelize');
/* const bcrypt = require('bcrypt'); */

class UserService {
	async update(data, userID, condition) {
		let allowedData = allowedProperties(data, [
			'regionID',
			'allowedRegions',
			'status',
			'name',
			'surname',
			'status',
			'isStudent',
			'birthday',
			'vkID',
			'photo',
		]);

		const baseCondition = { userID };
		const finalCondition = { ...condition, ...baseCondition };

		const isUpdated = await Model.update(allowedData, {
			where: finalCondition,
		});

		return isUpdated;
	}

	async getVKIDs(regionID) {
		const finalCondition = { regionID };
		const data = await Model.findAll({
			where: finalCondition,
			attributes: ['name', 'vkID'],
		});

		return data;
	}

	async create(user) {
		let data = allowedProperties(user, [
			'invitedBy',
			'vkID',
			'name',
			'surname',
			'status',
			'regionID',
			'isStudent',
			'birthday',
			'photo',
			'allowedRegions',
		]);

		try {
			const createdUser = await Model.create(data);
			return createdUser;
		} catch (e) {
			if (e?.original?.errno === 1062) {
				throw ApiError.BadRequest(
					`Пользователь с таким vkID ${user.vkID} уже существует!`
				);
			} else {
				throw ApiError.DBError(e);
			}
		}
	}

	async get(
		condition,
		include = [],
		order = ['surname', 'DESC'],
		limit = 250
	) {
		const exclude = ['createdAt', 'updatedAt'];
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
			limit,
		});

		return data;
	}

	async updateStats(id, aim, value) {
		if (!id) {
			throw ApiError.BadRequest('Не указан ID');
		}

		if (!aim || !value) {
			throw ApiError.BadRequest('Не указаны данные для обновления');
		}

		if (
			![
				'participantsCNT',
				'ideasCNT',
				'eventsCNT',
				'invitedCNT',
			].includes(aim)
		) {
			throw ApiError.BadRequest('Неверное значение aim');
		}
		const isUpdated = await Model.increment(aim, {
			by: value,
			where: { userID: id },
		});

		return Boolean(isUpdated[0][1]);
	}

	async getAgregation() {
		const CNT = await Model.count({
			attributes: ['status'],
			group: 'status',
			distinct: true,
			col: 'vkID',
		});

		return CNT;
	}

	/* 	async getStats(userID) {
		if (!userID) {
			throw ApiError.BadRequest('Не указан ID');
		}

		const where =
			userID != 'all' ? { userID: id } : { eventsCNT: { [Op.gt]: 0 } };

		const data = await Model.findAll({
			where,
			attributes: [
				'userID',
				'name',
				'surname',
				'photo',
				'ideasCNT',
				'eventsCNT',
				'invitedCNT',
			],
			order: ['participantsCNT', 'DESC'],
		});

		return data;
	} */

	/* 
    async getOne(id) {
        if (!id) {
            throw ApiError.BadRequest('Не указан ID');
        }
        const post = await Post.findById(id);
        return post;
    }


    async delete(id) {
            if (!id) {
                throw ApiError.BadRequest('Не указан ID');
            }
            const post = await Post.findByIdAndDelete(id);
            return post;
    } */
}

module.exports = new UserService();
