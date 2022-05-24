const Service = require('../Services/user');
const ApiError = require('../Utils/api-error');
const { Op } = require('sequelize');
const axios = require('axios');
const Log = require('../Utils/log');
const modelName = 'user';

const { validationResult } = require('express-validator');

function isAllowedNewRegion(allowedRegions, newRegion) {
	return allowedRegions.includes(parseInt(newRegion));
}

async function getVkPhoto(vkLink = '', vkID = '', next) {
	if (vkLink) {
		const splitedLink = vkLink.split('/');
		vkID = splitedLink[splitedLink.length - 1];
	}

	const response = await axios.get(
		`https://api.vk.com/method/users.get?user_ids=${vkID}&fields=photo_max&access_token=${process.env.VK_CIVITAS_SERVICE_TOKEN}&v=5.131`
	);

	if (response.data.error) {
		console.log(response.data);
		throw ApiError.BadRequest('Ошибка ссылки VK');
	}

	if (!response.data.response || response.data.response.length == 0) {
		return next(ApiError.BadRequest(`Пользователь VK не найден`));
	}

	if (!response.data.response[0].id) {
		return next(ApiError.BadRequest(`Данные VK не найдены`));
	}

	return [response.data.response[0].id, response.data.response[0].photo_max];
}

function checkIsCoordinator(current, newStatus) {
	let isCoordinator = current;
	if (newStatus) {
		isCoordinator = newStatus;
	}
	return isCoordinator == 'coordinator';
}
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

			const vkPhoto = await getVkPhoto(
				req.body.vkLink || '',
				req.body.vkID || '',
				next
			);

			req.body.vkID = vkPhoto[0];
			req.body.photo = vkPhoto[1];

			if (cretedStatus == 'coordinator') {
				if (
					!req.body.allowedRegions ||
					req.body.allowedRegions.length == 0
				) {
					return next(
						ApiError.BadRequest(`Не переданы разрешённые регионы`)
					);
				} else {
					if (
						!isAllowedNewRegion(
							req.body.allowedRegions,
							cretedRegion
						)
					) {
						return next(
							ApiError.BadRequest(
								`Выбранный регион не входит в список допустимых у пользователя`
							)
						);
					}
				}
			}

			if (req.body.allowedRegions) {
				req.body.allowedRegions = JSON.stringify(
					req.body.allowedRegions
				);
			}

			if (req.body.birthday) {
				req.body.birthday = new Date(
					Date.parse(req.body.birthday)
				).toLocaleDateString('en-CA');
			}

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
			let order = ['surname', 'DESC'];
			const userStatus = req.user.userStatus;
			if (userStatus == 'coordinator') {
				condition = {
					regionID: req.user.userAllowedRegions,
					status: { [Op.not]: ['admin', 'coordinator', 'federal'] },
				};
			}

			if (userStatus == 'active') {
				condition = {
					invitedBy: req.user.userID,
				};
			} else {
				order = ['participantsCNT', 'DESC'];
			}

			const data = await Service.get(condition, [], order);

			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getByID(req, res, next) {
		try {
			const data = await Service.get(
				{ userID: req.params.id },
				['name', 'surname', 'regionID', 'photo', 'status'],
				['userID', 'DESC'],
				1
			);

			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getByRegion(req, res, next) {
		try {
			let condition = {
				regionID: req.params.id,
				status: 'active',
			};
			let order = ['ideasCNT', 'DESC'];

			const userStatus = req.user.userStatus;
			if (userStatus == 'coordinator') {
				if (
					!req.user.userAllowedRegions.includes(
						parseInt(req.params.id)
					)
				) {
					return next(
						ApiError.Forbidden(`У тебя нет доступа к этому региону`)
					);
				}
			} else if (userStatus == 'active') {
				condition = {
					userID: req.user.userID,
				};
			}

			const data = await Service.get(
				condition,
				['userID', 'name', 'surname'],
				order
			);

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

			const limit = req.params.limit || 50;
			if (req.params.id == 'my') {
				condition = {
					userID: req.user.userID,
				};
			} else if (req.params.id == 'all') {
				condition = {
					status: 'active',
					[Op.or]: [
						{ eventsCNT: { [Op.gt]: 0 } },
						{ invitedCNT: { [Op.gt]: 0 } },
					],
				};
			} else {
				condition = {
					userID: req.params.id,
				};
			}

			const data = await Service.get(
				condition,
				include,
				['participantsCNT', 'DESC'],
				limit
			);

			let result = [];

			for (let i = 0; i < data.length; i++) {
				let user = data[i];
				let stats = [
					{
						title: 'Участников',
						value: user.participantsCNT,
					},
					{
						title: 'Идей',
						value: user.ideasCNT,
					},
					{
						title: 'Мероприятий',
						value: user.eventsCNT,
					},
					{
						title: 'Приглашено',
						value: user.invitedCNT,
					},
				];

				const { userID, name, surname, photo } = user;
				const info = { userID, name, surname, photo };
				//console.log(info);
				//result[i] = info;
				result[i] = { info, stats };
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

	/* 	return next(
		ApiError.Forbidden(
			`Статус (${req.user.userStatus}) не соответствует`
		)
	); */

	async update(req, res, next) {
		try {
			if (!req.body || req.body.length < 0) {
				return next(
					ApiError.BadRequest('Не переданы параметры в body!')
				);
			}

			if (req.params.id === 'me') {
				req.params.id = req.user.userID;
			}

			const target = await Service.get({ userID: req.params.id });

			if (target.length === 0) {
				return next(ApiError.BadRequest('Пользователь не найден'));
			}
			const targetStatus = target[0].status;
			const targetInvitedBy = target[0].invitedBy;
			const targetRegionID = target[0].regionID;
			const targetAllowedRegions = target[0].allowedRegions;

			if (targetStatus === 'admin') {
				return next(
					ApiError.Forbidden('Нельзя изменять эту роль через ИС')
				);
			}

			const isAddedByMe = targetInvitedBy == req.user.userID;
			const itsMe = req.params.id == req.user.userID;
			let acceptableStatuses = ['frozen', 'without_access'];
			let canChangeAllowedRegions = false;
			let canChangeRegion = false;
			let canEdit = true;

			switch (req.user.userStatus) {
				case 'active':
					acceptableStatuses = ['frozen', 'without_access'];
					canEdit = isAddedByMe;

					break;
				case 'coordinator':
					acceptableStatuses = ['active', 'frozen', 'without_access'];
					canEdit = req.user.userAllowedRegions.includes(
						parseInt(targetRegionID)
					);
					canChangeRegion = true;
					break;
				case 'federal':
					acceptableStatuses = [
						'coordinator',
						'active',
						'frozen',
						'without_access',
					];
					canChangeAllowedRegions = true;
					canChangeRegion = true;
					break;

				case 'admin':
					acceptableStatuses = [
						'federal',
						'coordinator',
						'active',
						'frozen',
						'without_access',
					];
					canChangeAllowedRegions = true;
					canChangeRegion = true;
					break;

				default:
					return next(
						ApiError.Forbidden(
							`Статус (${req.user.userStatus}) не описан`
						)
					);
			}

			canEdit = Boolean(
				canEdit * acceptableStatuses.includes(targetStatus)
			);

			if (req.body.regionID) {
				canEdit = Boolean(
					canEdit *
						req.user.userAllowedRegions.includes(
							parseInt(req.body.regionID)
						)
				);
			}

			if (itsMe) {
				canEdit = true;
			}

			if (req.body.regionID) {
				if (canChangeRegion) {
					if (!canChangeAllowedRegions) {
						canEdit = Boolean(
							canEdit *
								isAllowedNewRegion(
									req.user.userAllowedRegions,
									req.body.regionID
								)
						);
					} else {
						canEdit = true;
					}
				} else {
					canEdit = false;
				}

				if (checkIsCoordinator(targetStatus, req.body.status)) {
					let allowedRegions = targetAllowedRegions;
					if (allowedRegions) {
						allowedRegions = JSON.parse(allowedRegions);
					} else {
						allowedRegions = [];
					}
					if (req.body.allowedRegions) {
						allowedRegions = req.body.allowedRegions;
					}

					if (
						!isAllowedNewRegion(allowedRegions, req.body.regionID)
					) {
						return next(
							ApiError.BadRequest(
								'Регион пользователя не входит в разрешённые'
							)
						);
					}
				}
			}

			if (req.body.allowedRegions) {
				canEdit = Boolean(canEdit * canChangeAllowedRegions);

				if (checkIsCoordinator(targetStatus, req.body.status)) {
					let regionID = targetRegionID;
					if (req.body.regionID) {
						regionID = req.body.regionID;
					}

					if (
						!isAllowedNewRegion(req.body.allowedRegions, regionID)
					) {
						return next(
							ApiError.BadRequest(
								'Регион пользователя не входит в разрешённые'
							)
						);
					}
				}
			}

			if (req.body.vkLink) {
				const vkPhoto = await getVkPhoto(req.body.vkLink, '', next);
				req.body.vkID = vkPhoto[0];
				req.body.photo = vkPhoto[1];
			}

			if (req.body.birthday) {
				req.body.birthday = new Date(
					Date.parse(req.body.birthday)
				).toLocaleDateString('en-CA');
			}

			if (req.body.status) {
				canEdit = Boolean(
					canEdit * acceptableStatuses.includes(req.body.status)
				);
				if (req.body.status !== 'coordinator') {
					req.body.allowedRegions = null;
				}
			}

			if (!canEdit) {
				return next(
					ApiError.Forbidden('Нет прав на данное изменение!')
				);
			}

			const isUpdated = await Service.update(req.body, req.params.id);

			// Значения до изменений
			const prevValue = {};
			for (let [id] of Object.entries(req.body)) {
				prevValue[id] = target[0][id];
			}

			Log.add({
				userID: req.user.userID,
				action: 'update',
				newValue: req.body,
				aimModel: modelName,
				aimID: req.params.id,
				previousValue: prevValue,
			});

			return res.json({ success: Boolean(Number(isUpdated)) });
		} catch (e) {
			next(e);
		}
	}

	async getAgregation(req, res, next) {
		try {
			const data = await Service.getAgregation();
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	/* 	async getScoreboard(req, res, next) {} */

	/* 	async delete(req, res, next) {
		try {
			const post = await Service.de(req.params.id);
			return res.json(post);
		} catch (e) {
			next(e);
		}
	} */

	async actualize(req, res, next) {
		try {
			const cronUpdateUserStatistics = require('../Cron/updateUserStatistics');
			cronUpdateUserStatistics().then(
				function (result) {
					if (!result) {
						return console.log(
							'Обновления статистики пользователей не выполнено!'
						);
					}
				},
				function (error) {
					console.log('Ошибка обновления статистики пользователей!');
					return console.log(error);
				}
			);
			return res.json('success');
		} catch (e) {
			next(e);
		}
	}
}
module.exports = new UserController();
