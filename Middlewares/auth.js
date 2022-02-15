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
		if (!accessToken) {
			return next(ApiError.UnauthorizedError());
		}

		const validatedToken = tokenService.validateAccessToken(accessToken);
		if (!validatedToken) {
			return next(ApiError.UnauthorizedError());
		}

		const { userID } = validatedToken;
		const userDTO = await UserModel.findOne({
			where: { userID },
			attributes: ['status', 'regionID', 'allowedRegions'],
		});

		const userAllowedRegions = JSON.parse(userDTO.allowedRegions);
		if (!userAllowedRegions.includes(parseInt(userDTO.regionID))) {
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
