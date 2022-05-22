const Service = require('../Services/user');
const ApiError = require('../Utils/api-error');
const { Op } = require('sequelize');
const axios = require('axios');

const { validationResult } = require('express-validator');

class UserController {
	async create(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return next(
					ApiError.BadRequest(
						'Ошибка при валидации данных',
						errors.array()
					)
				);
			}

			const userAllowedRegions = req.user.userAllowedRegions;
			const cretedStatus = req.body.status;
			const cretedRegion = req.body.regionID;

			if (req.user.userStatus == 'admin') {
				if (cretedStatus == 'admin') {
					return next(
						ApiError.Forbidden(
							`Нельзя добавить нового админа через систему`
						)
					);
				}
			}

			if (req.user.userStatus == 'federal') {
				if (
					![
						'coordinator',
						'active',
						'without_access',
						'frozen',
					].includes(cretedStatus)
				) {
					return next(
						ApiError.Forbidden(
							`Статус (${req.user.userStatus}) не соответствует`
						)
					);
				}
			}

			if (req.user.userStatus == 'coordinator') {
				if (
					!['active', 'without_access', 'frozen'].includes(
						cretedStatus
					)
				) {
					return next(
						ApiError.Forbidden(
							`Статус (${req.user.userStatus}) не соответствует`
						)
					);
				}

				if (!userAllowedRegions.includes(parseInt(cretedRegion))) {
					return next(
						ApiError.Forbidden(`У тебя нет доступа к этому региону`)
					);
				}
			}

			if (req.user.userStatus == 'active') {
				if (!['without_access'].includes(cretedStatus)) {
					return next(
						ApiError.Forbidden(
							`Статус (${req.user.userStatus}) не соответствует`
						)
					);
				}

				if (!userAllowedRegions.includes(parseInt(cretedRegion))) {
					return next(
						ApiError.Forbidden(`У тебя нет доступа к этому региону`)
					);
				}
			}

			req.body.invitedBy = req.user.userID;

			if (!req.body.vkID && !req.body.vkLink) {
				return next(ApiError.BadRequest(`Не переданы данные ВК`));
			}

			if (req.body.vkLink) {
				const splitedLink = req.body.vkLink.split('/');
				req.body.vkID = splitedLink[splitedLink.length - 1];
			}

			const response = await axios.get(
				`https://api.vk.com/method/users.get?user_ids=${req.body.vkID}&fields=photo_max&access_token=${process.env.VK_CIVITAS_SERVICE_TOKEN}&v=5.131`
			);

			if (response.data.error) {
				console.log(response.data);
				throw ApiError.BadRequest('Ошибка ссылки ВК');
			}

			if (!response.data.response[0].id) {
				return next(ApiError.BadRequest(`Данные VK не найдены`));
			}

			req.body.vkID = response.data.response[0].id;
			req.body.photo = response.data.response[0].photo_max;

			const created = await Service.create(req.body);
			let success = true;
			if (!created || created.length === 0) {
				success = false;
			}

			if (success) {
				const UserService = require('../Services/user');
				await UserService.updateStats(req.user.userID, 'invitedCNT', 1);
			}

			return res.json({ success, data: created });
		} catch (e) {
			next(e);
		}
	}

	async getAll(req, res, next) {
		try {
			let condition = {};

			if (req.user.userStatus == 'coordinator') {
				condition = {
					regionID: req.user.userAllowedRegions,
					status: { [Op.not]: ['admin', 'coordinator', 'federal'] },
				};
			}

			if (req.user.userStatus == 'active') {
				condition = {
					invitedBy: req.user.userID,
				};
			}

			const data = await Service.get(condition);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getStats(req, res, next) {
		try {
			let condition = {};
			let include = [
				'participantsCNT',
				'ideasCNT',
				'eventsCNT',
				'invitedCNT',
				'userID',
				'name',
				'surname',
				'photo',
			];
			if (req.params.id == 'my') {
				condition = {
					userID: req.user.userID,
				};
			} else if (req.params.id == 'all') {
				condition = {
					status: ['active', 'coordinator'],
				};
			} else {
				condition = {
					userID: req.params.id,
				};
			}

			const data = await Service.get(condition, include, [
				'participantsCNT',
				'DESC',
			]);

			let result = {};

			for (var i = 0; i < data.length; i++) {
				let element = data[i];
				let stats = [
					{
						title: 'Всего участников',
						value: element.participantsCNT,
					},
					{
						title: 'Всего идей',
						value: element.ideasCNT,
					},
					{
						title: 'Всего мероприятий',
						value: element.eventsCNT,
					},
					{
						title: 'В моём сообществе',
						value: element.invitedCNT,
					},
				];

				result[i] = stats;
				result[i] = { stats, info: data[i] };
			}

			return res.json(result);
		} catch (e) {
			next(e);
		}
	}

	/*
  async getOne(req, res, next) {
      try {
          const post = await PostService.getOne(req.params.id)
          return res.json(post)
      } catch (e) {
          next(e);
      }
  }
 */

	async update(req, res, next) {
		try {
			if (!req.body || req.body.length < 0) {
				return next(
					ApiError.BadRequest('Не переданы параметры в body!')
				);
			}
			//const userAllowedRegions = JSON.parse(userDTO.allowedRegions);

			if (
				!['admin', 'federal', 'coordinator'].includes(
					req.user.userStatus
				)
			) {
				return next(
					ApiError.Forbidden(
						`Статус (${req.user.userStatus}) не соответствует`
					)
				);
			}

			// Менять регион всем

			// Админ изменять статус всем кроме админов
			// Федерал изменять статус всем кроме федералам и кроме админов
			// Координатор изменять статус всем в своём регионе

			if (req.body.regionID) {
				if (
					!req.user.userAllowedRegions.includes(
						parseInt(req.body.regionID)
					)
				) {
					return next(ApiError.Forbidden());
				}

				const isUpdated = await Service.update(
					req.body,
					req.user.userID
				);

				return res.json({ success: Boolean(Number(isUpdated)) });
			} else if (req.body.allowedRegions || req.body.status) {
				let condition = {};

				if (req.user.userStatus == 'admin') {
					condition = {
						status: { [Op.not]: 'admin' },
					};

					if (['admin'].includes(req.body.status)) {
						return next(
							ApiError.Forbidden(
								`Нельзя добавить статус админа через систему`
							)
						);
					}
				}

				if (req.user.userStatus == 'federal') {
					condition = {
						status: { [Op.not]: ['admin', 'federal'] },
					};

					if (['admin', 'federal'].includes(req.body.status)) {
						return next(
							ApiError.Forbidden(`Нельзя добавить этот статус`)
						);
					}
				}

				if (req.user.userStatus == 'coordinator') {
					condition = {
						regionID: req.user.userAllowedRegions,
					};

					if (
						!['frozen', 'active', 'without_access'].includes(
							req.body.status
						)
					) {
						return next(
							ApiError.Forbidden(`Нельзя добавить этот статус`)
						);
					}
				}
				console.log(req.body);
				console.log(req.params.id);
				console.log(condition);
				const isUpdated = true;

				/* 			const isUpdated = await Service.update(
					req.body,
					req.params.id,
					condition
				); */
				return res.json({ success: Boolean(Number(isUpdated)) });
			}
		} catch (e) {
			next(e);
		}
	}

	/* 	async delete(req, res, next) {
		try {
			const post = await Service.de(req.params.id);
			return res.json(post);
		} catch (e) {
			next(e);
		}
	} */
}
module.exports = new UserController();
