const Service = require('../Services/user');
const ApiError = require('../Utils/api-error');
const { Op } = require('sequelize');

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
					!['coordinator', 'active', 'without_access'].includes(
						cretedStatus
					)
				) {
					return next(
						ApiError.Forbidden(
							`Статус (${req.user.userStatus}) не соответствует`
						)
					);
				}
			}

			if (req.user.userStatus == 'coordinator') {
				if (!['active', 'without_access'].includes(cretedStatus)) {
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

			const user = await Service.create(req.body);

			return res.json(user);
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
					status: 'active',
				};
			}

			if (req.user.userStatus == 'active') {
				condition = {
					invitedBy: req.user.userID,
					status: 'without_access',
				};
			}

			const data = await Service.getAll(condition);
			return res.json(data);
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
				const isUpdated = await Service.update(
					req.body,
					req.params.id,
					condition
				);
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
