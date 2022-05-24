const Service = require('../Services/regionStatistics');
const MarafonParticipantService = require('../Services/marafonParticipant');
const MarafonIdeaService = require('../Services/marafonIdea');
const UserService = require('../Services/user');
const ApiError = require('../Utils/api-error');

/* const TeamService = require('../Services/participant'); */
const { Op } = require('sequelize');

class RegionStatisticsController {
	async publicGetAll(req, res, next) {
		try {
			const data = await Service.get({ participantsCNT: { [Op.gt]: 0 } });
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getUsersRating(req, res, next) {
		try {
			const data = await Service.get({ participantsCNT: { [Op.gt]: 0 } });
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async getAll(req, res, next) {
		let data = {};
		let result = [];
		try {
			switch (req.user.userStatus) {
				case 'coordinator':
					data = await Service.sum({
						regionID: req.user.userAllowedRegions,
					});
					data = data[0];
					result = [
						{
							title: 'Участников',
							value: data.participantsCNT,
						},
						{
							title: 'Идей',
							value: data.ideasCNT,
						},
						{
							title: 'Мероприятий',
							value: data.eventsCNT,
						},
					];

					break;
				case 'federal':
				case 'admin':
					const regionsDB = await Service.get();

					let regions = {};
					const federal = {
						participantsCNT: 0,
						ideasCNT: 0,
						eventsCNT: 0,
					};

					const coordinators = await UserService.get(
						{ status: 'coordinator' },
						['name', 'surname', 'photo', 'allowedRegions']
					);

					regionsDB.map((region, index) => {
						const participantsCNT = region.participantsCNT;
						const ideasCNT = region.ideasCNT;
						const eventsCNT = region.eventsCNT;
						const activeCNT = region.activeCNT;
						const without_accessCNT = region.without_accessCNT;
						const title = region.title;

						federal.participantsCNT += participantsCNT;
						federal.ideasCNT += ideasCNT;
						federal.eventsCNT += eventsCNT;
						regions[region.regionID] = {
							participantsCNT,
							ideasCNT,
							eventsCNT,
							without_accessCNT,
							activeCNT,
							title,
						};
					});

					const districtStats = [];

					coordinators.map((coordinator, index) => {
						let participantsCNT = 0;
						let ideasCNT = 0;
						let eventsCNT = 0;
						let activeCNT = 0;
						let without_accessCNT = 0;

						const coordinatorRegions = JSON.parse(
							coordinator.allowedRegions
						);
						coordinatorRegions.map((id) => {
							const region = regions[id];
							if (region?.title) {
								participantsCNT += region.participantsCNT;
								ideasCNT += region.ideasCNT;
								eventsCNT += region.eventsCNT;
								activeCNT += region.activeCNT;
								without_accessCNT += region.without_accessCNT;
							}
						});

						districtStats.push({
							info: {
								fullName: `${coordinator.name} ${coordinator.surname}`,
								regions: coordinatorRegions,
								photo: coordinator.photo,
							},
							stats: {
								participantsCNT,
								ideasCNT,
								eventsCNT,
								activeCNT,
								without_accessCNT,
							},
						});
					});
					result = {
						titles: {
							federal: {
								participantsCNT: 'Участников',
								ideasCNT: 'Идей',
								eventsCNT: 'Мероприятий',
							},
							district: {
								participantsCNT: 'Участников',
								ideasCNT: 'Идей',
								eventsCNT: 'Мероп.',
								activeCNT: 'Наставников',
								without_accessCNT: 'Организ.',
							},
						},
						federal,
						districts: districtStats,
					};
					break;

				default:
					return next(
						ApiError.Forbidden(
							`Статус (${req.user.userStatus}) не описан`
						)
					);
			}

			//result.stats = stats;
			/* console.log(result.districts); */
			return res.json(result);
		} catch (e) {
			next(e);
		}
	}

	/* 	async getStats(req, res, next) {
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
					status: ['active', 'coordinator', 'without_access'],
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
	} */

	async actually(req, res, next) {
		try {
			const data = await Service.getByRegionID(req.user.userRegionID);
			return res.json(data);
		} catch (e) {
			next(e);
		}
	}

	async init(req, res, next) {
		try {
			await Service.init();
			return res.json('success');
		} catch (e) {
			next(e);
		}
	}

	async update(req, res, next) {
		try {
			const cronUpdateRegionStatistics = require('../Cron/updateRegionStatistics');
			cronUpdateRegionStatistics().then(
				function (result) {
					if (!result) {
						return console.log(
							'Обновления статистики регионов не выполнено!'
						);
					}
				},
				function (error) {
					console.log('Ошибка обновления статистики регионов!');
					return console.log(error);
				}
			);
			return res.json('success');
		} catch (e) {
			next(e);
		}
	}

	/* 
	async recalculation(req, res, next) {
		try {
			const data = await TeamService.getRegionStats(14);
			const data = await TeamService.getAllStats();
			return res.json(data);

			/* 			if(req.user.Sta)


			const condition = { regionID: req.user.userRegionID };
			
			return res.json(data);
		} catch (e) {
			next(e);
		}
	} */
}

module.exports = new RegionStatisticsController();
