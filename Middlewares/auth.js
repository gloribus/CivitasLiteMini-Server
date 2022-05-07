const ApiError = require('../Utils/api-error');
const tokenService = require('../Services/token');
const UserModel = require('../Models').user;

module.exports = async function (req, res, next) {
	try {
		const authorizationHeader = req.headers.authorization;

		if (!authorizationHeader) {
			return next(ApiError.UnauthorizedError());
		}

		const accessToken = authorizationHeader.split(' ')[1];
		if (!accessToken && process.env.NODE_ENV != 'development') {
			return next(ApiError.UnauthorizedError());
		}

		let validatedToken = tokenService.validateAccessToken(accessToken);
		if (!validatedToken && process.env.NODE_ENV != 'development') {
			return next(ApiError.UnauthorizedError());
		}

		let userID = null;
		if (process.env.NODE_ENV == 'development' && !validatedToken) {
			let securityCheck = authorizationHeader.split('__');
			if (securityCheck[1] == '1dadqwe$$131#') {
				userID = securityCheck[0];
				validatedToken = { userID };
			}
		} else {
			userID = validatedToken.userID;
		}

		const userDTO = await UserModel.findOne({
			where: { userID },
			attributes: ['status', 'regionID', 'allowedRegions'],
		});

		if (!userDTO) {
			return next(ApiError.UnauthorizedError());
		}

		let userAllowedRegions = [];
		userAllowedRegions.push(userDTO.regionID);
		if (userDTO.status == 'coordinator') {
			if (userDTO.allowedRegions && userDTO.allowedRegions.length) {
				userAllowedRegions = JSON.parse(userDTO.allowedRegions);
			}
		}

		// Закрыть доступ этим категориям к системе
		if (['frozen', 'without_access'].includes(userDTO.status)) {
			return next(ApiError.Forbidden());
		}

		if (
			userDTO.status == 'coordinator' &&
			!userAllowedRegions.includes(parseInt(userDTO.regionID))
		) {
			return next(ApiError.Forbidden());
		}

		let dto = validatedToken;
		dto.userStatus = userDTO.status;
		dto.userRegionID = userDTO.regionID;
		dto.userAllowedRegions = userAllowedRegions;

		req.user = dto;

		next();
	} catch (e) {
		console.log(e);
		return next(ApiError.UnauthorizedError());
	}
};
