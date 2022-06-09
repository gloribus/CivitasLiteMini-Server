const Service = require('../Services/marafonIdea');
const TeamService = require('../Services/team');
const UserService = require('../Services/user');
const MarafonParticipantService = require('../Services/marafonParticipant');
const MarafonIdeaService = require('../Services/marafonIdea');
const EventService = require('../Services/event');
const { Op } = require('sequelize');
const { default: didyoumean3 } = require('didyoumean3');
const didYouMean = require('didyoumean2').default;

const ApiError = require('../Utils/api-error');
const axios = require('axios');

async function getVKID (vkAccessToken) {
	response = await axios.get(
		`https://api.vk.com/method/users.get?access_token=${vkAccessToken}&v=5.131`
	);

	if (response.data.error) {
		console.log(response.data);
		return { status: 'error', data: 'Ошибка проверки VK авторизации [1]' };
	}

	if (!response.data?.response[0]) {
		console.log(response.data);
		return {
			status: 'error',
			data: 'Ошибка проверки VK авторизации [1.1]',
		};
	}

	return { status: 'success', data: response.data.response[0] };
}

class MarafonPublicController {
	async authVK (req, res, next) {
		try {
			let vkCode = null;
			let vkAccessToken = null;
			if (req.params.code.length > 40) {
				vkAccessToken = req.params.code;
			} else {
				vkCode = req.params.code;
			}

			const data = {};

			let response;
			if (vkCode) {
				try {
					response = await axios.get(
						`https://oauth.vk.com/access_token?client_id=8165820&client_secret=SQRzKBv8Aux9gQqPcIZl&redirect_uri=https://xn--80aa8agek3a.xn--b1aeda3a0j.xn--p1ai/form&code=${vkCode}`
					);
				} catch (err) {
					if (err.response.status) {
						return next(
							ApiError.BadRequest(
								'Ошибка ВК. Перезагрузите страницу'
							)
						);
					}
				}

				vkAccessToken = response.data.access_token;
			}

			let participantVKID;
			if (vkAccessToken) {
				const VKAnswer = await getVKID(vkAccessToken);
				const VK = VKAnswer.data;
				if (VKAnswer.status === 'error') {
					return next(ApiError.BadRequest(VK));
				}
				data.vkID = VK.id;
				data.name = VK.first_name;
				data.surname = VK.last_name;
				data.vkAccessToken = vkAccessToken;
				participantVKID = data.vkID;
			} else {
				return next(
					ApiError.BadRequest('Нет токена для авторизации VK')
				);
			}

			const participant = await MarafonParticipantService.getAll({
				vkID: participantVKID,
			});
			const userData = participant[0]?.dataValues || {};

			let ideaData = {};

			if (userData.ideaID) {
				const ideas = await MarafonIdeaService.get(
					{
						[Op.or]: [
							/* { eventID: userData.eventID }, */
							{ uuid: userData.ideaID },
						],
					},
					['title', 'uuid']
				);
				ideaData = ideas[0]?.dataValues || {};

				if (ideaData) {
					const ideaParticipants =
						await MarafonParticipantService.getAll(
							{
								ideaID: ideaData.uuid,
							},
							['name', 'surname']
						);

					ideaData.participants =
						JSON.stringify(ideaParticipants) || [];
					ideaData.participants = JSON.parse(ideaData.participants);
				}
			}

			return res.json({ ...data, ...userData, idea: ideaData });
		} catch (e) {
			next(e);
		}
	}

	async createParticipant (req, res, next) {
		try {
			const data = req.body;

			let participantVKID;
			if (data.vkAccessToken) {
				const VKAnswer = await getVKID(data.vkAccessToken);
				const VK = VKAnswer.data;
				if (VKAnswer.status === 'error') {
					return next(ApiError.BadRequest(VK));
				}
				data.vkID = VK.id;
				data.name = VK.first_name;
				data.surname = VK.last_name;
			} else {
				return next(
					ApiError.BadRequest('Нет токена для авторизации VK')
				);
			}

			const checkInParticipnats = await MarafonParticipantService.getAll({
				vkID: data.vkID,
			});

			if (checkInParticipnats.length > 0) {
				return next(ApiError.BadRequest('participant already exist'));
			}

			// Подстановка предзаписанных данных
			if (data.code) {
				const event = await EventService.get({ id: data.code }, [
					'regionID',
					'locality',
					'school',
					'userID',
				]);

				if (event.length == 0) {
					return next(
						ApiError.BadRequest('Код мероприятия не найден!')
					);
				}

				data.regionID = event[0].regionID;
				data.locality = event[0].locality;
				data.school = event[0].school;
				data.invitedBy = event[0].userID;

				data.eventID = data.code;
			} else if (!data.locality && data.regionID) {
				return next(ApiError.BadRequest('Не переданы данные'));
			}

			// Create Participant
			const participant = await MarafonParticipantService.create(
				data,
				false
			);

			if (!participant) {
				return next(
					ApiError.BadRequest('Ошибка создания пользователя')
				);
			}

			if (data.eventID) {
				await EventService.updateStats(
					data.eventID,
					'participantsCNT',
					1
				);
				await UserService.updateStats(
					data.invitedBy,
					'participantsCNT',
					1
				);
			}

			const {
				grade,
				locality,
				school,
				name,
				surname,
				regionID,
				telephone,
			} = participant;

			return res.json({
				grade,
				locality,
				school,
				name,
				surname,
				regionID,
				telephone,
			});
		} catch (e) {
			next(e);
		}
	}

	async createIdea (req, res, next) {
		try {
			const data = req.body;

			if (data.vkAccessToken) {
				const VKAnswer = await getVKID(data.vkAccessToken);
				const VK = VKAnswer.data;
				if (VKAnswer.status === 'error') {
					return next(ApiError.BadRequest(VK));
				}
				data.vkID = VK.id;
			} else {
				return next(
					ApiError.BadRequest('Нет токена для авторизации VK')
				);
			}

			const participant = await MarafonParticipantService.getAll({
				vkID: data.vkID,
			});
			const userData = participant[0]?.dataValues || {};

			data.eventID = userData.eventID;
			data.regionID = userData.regionID;
			data.userID = userData.uuid;

			if (data.title) {
				const ideaID = await MarafonIdeaService.create(data);

				if (!data.team) {
					data.team = [];
				}

				data.team.push(data.userID);

				await MarafonParticipantService.update({ ideaID }, data.team);

				if (data.eventID) {
					await EventService.updateStats(data.eventID, 'ideasCNT', 1);

					const event = await EventService.get({ id: data.eventID }, [
						'userID',
					]);

					await UserService.updateStats(
						event[0].dataValues.userID,
						'ideasCNT',
						1
					);
				}

				return res.json({ ideaID });
			} else {
				return next(ApiError.BadRequest('Не переданы данные идеи'));
			}
		} catch (e) {
			next(e);
		}
	}

	async manualAdd (req, res, next) {
		try {
			const add = require('../Utils/manualAdd/add');
			add(req).then(
				function (result) {
					if (!result) {
						console.log('Загрузка участников не выполнена!');
						return next(
							ApiError.BadRequest(
								'Загрузка участников не выполнена!'
							)
						);
					}
				},
				function (error) {
					console.log('Ошибка загрузки участников!');
					console.log(error);
					return next(
						ApiError.BadRequest('Ошибка загрузки участников!')
					);
				}
			);
			return res.json('success');
		} catch (e) {
			next(e);
		}
	}

	async predictEventID (req, res, next) {
		try {
			const { regionID, locality } = req.query;
			if (regionID && locality) {
				const events = await EventService.get({ regionID: regionID }, [
					'locality',
					'school',
					'id',
				]);

				const localityArray = [];

				events.map((event) => {
					event = event.dataValues;
					localityArray.push(event.locality);
				});

				const predict = didYouMean(locality, localityArray);

				const eventsPredicted = [];
				if (predict) {
					events.map((event) => {
						event = event.dataValues;
						if (event.locality === predict) {
							eventsPredicted.push(event);
						}
					});
				}

				return res.json(eventsPredicted);
			}
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new MarafonPublicController();
