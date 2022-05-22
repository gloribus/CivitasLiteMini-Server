const AuthService = require('../Services/auth');
const { validationResult } = require('express-validator');
const ApiError = require('../Utils/api-error');
const axios = require('axios');
class AuthController {
	/*   async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return next(ApiError.BadRequest('Ошибка при валидации данных', errors.array()))
      }
      const userData = await AuthService.registration(req.body);
      // TODO: secure only
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  } */

	/* 	async loginByVK(req, res, next) {
		try {
			if (req.query.code) {
				const code = req.query.code;

				const response = await axios.get(
					`https://oauth.vk.com/access_token?client_id=8055716&client_secret=r4LlhoVZxTkklA5wVuoG&redirect_uri=http://localhost:5000/auth/login/vk&code=${code}`
				);

				const vkID = response.data.user_id;

				const logiuserDatanByVK = await AuthService.loginByVK(vkID);
			// TODO: secure only
			res.cookie('refreshToken', userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
			});
			return res.json(userData);

				return res.redirect('/');
			} else {
				return res.redirect(
					'https://oauth.vk.com/authorize?client_id=8055716&display=page&redirect_uri=http://localhost:5000/auth/login/vk&scope=friends&response_type=code&v=5.131'
				);
			}
		} catch (e) {
			next(e);
		}
	} */

	//https://oauth.vk.com/authorize?client_id=8055716&display=page&redirect_uri=http://localhost:3000/auth/login/vk&response_type=token&v=5.131&state=CIVITAS

	async loginByVK(req, res, next) {
		try {
			const { token } = req.body;

			const response = await axios.get(
				`https://api.vk.com/method/users.get?access_token=${token}&v=5.131`
			);

			if (response.data.error) {
				console.log(response.data);
				throw ApiError.BadRequest('Ошибка проверки токена [1]');
			}

			const vkID = response.data.response[0].id;

			if (vkID < 1) {
				console.log(response.data);
				throw ApiError.BadRequest('Ошибка проверки токена [2]');
			}

			const userData = await AuthService.loginByVK(vkID);
			// TODO: secure only
			res.cookie('refreshToken', userData.token.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
			});
			return res.json(userData);
		} catch (e) {
			next(e);
		}
	}

	/* 	async login(req, res, next) {
		try {
			const { login, password } = req.body;
			const userData = await AuthService.login(login, password);
			// TODO: secure only
			res.cookie('refreshToken', userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
			});
			return res.json(userData);
		} catch (e) {
			next(e);
		}
	} */

	async logout(req, res, next) {
		try {
			const { refreshToken } = req.cookies;
			const token = await AuthService.logout(refreshToken);
			res.clearCookie('refreshToken');
			return res.json(token);
		} catch (e) {
			next(e);
		}
	}

	async refresh(req, res, next) {
		try {
			const { refreshToken } = req.cookies;
			const userData = await AuthService.refresh(refreshToken);
			res.cookie('refreshToken', userData.token.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true,
			});

			return res.json(userData);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new AuthController();
