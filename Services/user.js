const Model = require('../Models').user;
const ApiError = require('../Utils/api-error');
const allowedProperties = require('../Utils/allowed-properties');
/* const bcrypt = require('bcrypt'); */

class UserService {
	async update(data, userID, condition) {
		let allowedData = allowedProperties(data, [
			'regionID',
			'allowedRegions',
			'status',
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
			'allowedRegions',
		]);

		try {
			const createdUser = await Model.create(data);
			return createdUser.userID;
		} catch (e) {
			if (e?.original?.errno === 1062) {
				console.log(1234);
				throw ApiError.BadRequest(
					`Пользователь с таким vkID ${user.vkID} уже существует!`
				);
			} else {
				throw ApiError.DBError(e);
			}
		}
	}

	async getAll(condition) {
		const exclude = ['createdAt', 'updatedAt'];
		const finalCondition = { ...condition };

		const data = await Model.findAll({
			where: finalCondition,
			attributes: { exclude },
			order: [['surname', 'DESC']],
		});

		return data;
	}
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
