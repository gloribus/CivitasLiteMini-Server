const Model = require('../Models').user;
/* const ApiError = require('../Utils/api-error'); */
const allowedProperties = require('../Utils/allowed-properties');
/* const bcrypt = require('bcrypt'); */

class UserService {
	async update(data, userID, condition) {
		let allowedData = allowedProperties(data, ['regionID']);

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
			attributes: ['name', 'vkID']
		});

		return data;
	}

	/* 	async create(user) {
		let data = allowedProperties(user, [
			'invitedBy',
			'login',
			'password',
			'invitedD',
			'name',
			'surname',
			'patronymic',
			'birthday',
		]);

		if (typeof data.password !== 'undefined') {
			data.password = await bcrypt.hash(data.password, 10);
		}

		try {
			const createdUser = await UserModel.create(data);
			return createdUser.userID;
		} catch (e) {
			if (typeof e?.original?.errno === 1062) {
				throw ApiError.BadRequest(
					`Пользователь с таким логином ${user.login} уже существует!`
				);
			} else {
				throw ApiError.DBError(e);
			}
		}
	} */

	/* async getAll() {
        const posts = await Post.find();
        return posts;
    }
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
