const UserModel = require('../Models').user;
const UserService = require('./user');
const tokenService = require('./token');
/* const bcrypt = require('bcrypt'); */
const ApiError = require('../Utils/api-error');

class AuthService {
	async registration(user) {
		const userID = await UserService.create(user);

		// TODO: Platform в токене хранить (чтобы токен нельзя скопировать)
		const tokens = tokenService.generateTokens({ userID });
		await tokenService.saveToken(userID, tokens.refreshToken);
		return { ...tokens, userID };
	}

	/* 	async login(login, password) {
		const user = await UserModel.findOne({ where: { login } });
		if (!user) {
			throw ApiError.BadRequest('Пользователь с таким логином не найден');
		}
		const isPassEquals = await bcrypt.compare(password, user.password);
		if (!isPassEquals) {
			throw ApiError.BadRequest('Неверный пароль');
		}

		const userID = user.userID;

		const tokens = tokenService.generateTokens({ userID });

		await tokenService.saveToken(userID, tokens.refreshToken);
		return { ...tokens, userID };
	} */

	async loginByVK(vkID) {
		const user = await UserModel.findOne({
			where: { vkID },
			attributes: [
				'userID',
				'status',
				'regionID',
				'name',
				'surname',
				'allowedRegions',
			],
		});
		if (!user) {
			throw ApiError.BadRequest('Пользователь не найден');
		}

		const userID = user.userID;
		const status = user.status;
		const regionID = user.regionID;
		const fullName = user.name + ' ' + user.surname;
		const allowedRegions = JSON.parse(user.allowedRegions);

		const tokens = tokenService.generateTokens({ userID });

		await tokenService.saveToken(userID, tokens.refreshToken);
		return {
			token: { ...tokens },
			user: { userID, status, regionID, fullName, allowedRegions },
		};
	}

	async logout(refreshToken) {
		const token = await tokenService.removeToken(refreshToken);
		return token;
	}

	async refresh(refreshToken) {
		if (!refreshToken) {
			throw ApiError.UnauthorizedError();
		}

		const tokenData = tokenService.validateRefreshToken(refreshToken);

		const tokenFromDb = await tokenService.findToken(refreshToken);
		if (!tokenData || !tokenFromDb) {
			throw ApiError.UnauthorizedError();
		}

		const user = await UserModel.findOne({
			where: { userID: tokenData.userID },
			attributes: [
				'userID',
				'status',
				'regionID',
				'name',
				'surname',
				'allowedRegions',
			],
		});

		const userID = user.userID;
		const status = user.status;
		const regionID = user.regionID;
		const fullName = user.name + ' ' + user.surname;
		const allowedRegions = JSON.parse(user.allowedRegions);

		const tokens = tokenService.generateTokens({ userID });

		await tokenService.saveToken(userID, tokens.refreshToken);
		return {
			token: { ...tokens },
			user: { userID, status, regionID, fullName, allowedRegions },
		};
	}

	async getAllUsers() {
		const users = await UserModel.findAll();
		return users;
	}
}

module.exports = new AuthService();
