const ParticipantService = require('../Services/participant');
const TeamService = require('../Services/team');
const UserService = require('../Services/user');
const MarafonParticipantService = require('../Services/marafonParticipant');
const Bot = require('../Utils/bot');
const axios = require('axios');

const { validationResult } = require('express-validator');
const ApiError = require('../Utils/api-error');

class HandlerController {
	/* 	async create(req, res, next) {
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

     const object = await Service.create(req.body);

     return res.status(201).json(object);
   } catch (e) {
     next(e);
   }
 } */

	async marafonForm(req, res, next) {
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

			const data = req.body;
			const EventService = require('../Services/event');

			// Убрать пробелы вконце строки (тримация)
			Object.keys(data).map(
				(k) =>
					(data[k] =
						typeof data[k] == 'string' ? data[k].trim() : data[k])
			);

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
			}

			let response;

			try {
				response = await axios.get(
					`https://oauth.vk.com/access_token?client_id=8165820&client_secret=SQRzKBv8Aux9gQqPcIZl&redirect_uri=https://xn--80aa8agek3a.xn--b1aeda3a0j.xn--p1ai/form&code=${data.vkCode}`
				);
			} catch (err) {
				if (err.response.status) {
					return next(
						ApiError.BadRequest('Ошибка ВК. Перезагрузите страницу')
					);
				}
			}
			const vkAccessToken = response.data.access_token;

			response = await axios.get(
				`https://api.vk.com/method/users.get?access_token=${vkAccessToken}&v=5.131`
			);

			if (response.data.error) {
				console.log(response.data);
				return next(
					ApiError.BadRequest('Ошибка проверки VK авторизации [1]')
				);
			}

			data.vkID = response.data.response[0].id;
			data.name = response.data.response[0].first_name;
			data.surname = response.data.response[0].last_name;

			const participantVKID = data.vkID;

			// Провека уникальности и не является ли пользователем системы

			const checkInUsers = await UserService.get({
				vkID: participantVKID,
			});

			if (checkInUsers.length === 1 && data.code != 'test') {
				return next(
					ApiError.BadRequest(
						'Пользователю Civitas нельзя отправлять обычные заявки! Используй код test'
					)
				);
			}

			const checkInParticipnats = await MarafonParticipantService.getAll({
				vkID: participantVKID,
			});

			if (checkInParticipnats.length > 0) {
				return next(ApiError.BadRequest('participant already exist'));
			}

			/* 			
			const checkVKHash = require('../Utils/checkVKHash');
			if (
				!checkVKHash(
					process.env.VK_MARAFON_APP_ID,
					data.vkID,
					process.env.VK_MARAFON_APP_SECRET,
					data.vkHash
				)
			) {
				return next(
					ApiError.BadRequest('Ошибка проверка VK авторизации')
				);
			} */

			// Create Participant
			const participantID = await MarafonParticipantService.create(data);

			if (!participantID) {
				return next(
					ApiError.BadRequest('Ошибка создания пользователя')
				);
			}

			// Create Idea
			if (data.title) {
				const MarafonIdeaService = require('../Services/marafonIdea');
				const ideaID = await MarafonIdeaService.create(data);

				if (!data.team) {
					data.team = [];
				}

				data.team.push(participantID);

				// ? можте добавить проверку по eventID
				await MarafonParticipantService.update({ ideaID }, data.team);

				if (data.code) {
					await EventService.updateStats(data.code, 'ideasCNT', 1);
					await UserService.updateStats(
						data.invitedBy,
						'ideasCNT',
						1
					);
				}
			}

			if (data.code) {
				await EventService.updateStats(data.code, 'participantsCNT', 1);
				await UserService.updateStats(
					data.invitedBy,
					'participantsCNT',
					1
				);
			}

			return res.status(200).send('ok');
		} catch (e) {
			next(e);
		}
	}

	async registration(req, res, next) {
		try {
			const data = req.body;

			Object.keys(data).map(
				(k) =>
					(data[k] =
						typeof data[k] == 'string' ? data[k].trim() : data[k])
			);
			const regionID =
				parseInt(data.regionID) || parseInt(data.regionIDFromLink);

			if (data.formid === 'form410944671') {
				// SEND TO VK
				const users = await UserService.getVKIDs({
					regionID,
					status: 'active',
				});
				const vkIDS = [];
				const fromList = {
					form410944671: {
						title: 'БПИ',
						action: 'Регистрация в турнире (одиночная)',
					},
					form412922667: {
						title: 'ЯВделе',
						action: 'Регистрация в программе',
					},
				};
				users.map((user) => {
					vkIDS.push(user.vkID);
				});
				let msg =
					`🥳 Новая заявка с сайта ${fromList[data.formid].title}\n` +
					`${fromList[data.formid].action}\n---------\n` +
					`${data.name}\n` +
					`${data.surname}\n` +
					`${data.birthday}\n` +
					`${data.socialLink}\n` +
					`${data.telephone}\n` +
					`${data.universityName}\n` +
					`${data.facultyName}`;

				Bot.sendMsg(vkIDS, msg);
			} else if (data.formid === 'form412922667') {
				// SEND TO VK
				const users = await UserService.getVKIDs({
					regionID,
					status: 'active',
				});
				const vkIDS = [];
				const title = 'ЯВделе';
				const action = 'Регистрация в программе';

				users.map((user) => {
					vkIDS.push(user.vkID);
				});

				const msg =
					`🥳 Новая заявка с сайта ${title}\n` +
					`${action}\n---------\n` +
					`${data.name}\n` +
					`${data.socialLink}\n` +
					`${data.telephone}\n` +
					`📣 Это не заявка с Марафона идей, это регистрация в программе «Я в деле» (основной сайт)`;

				Bot.sendMsg(vkIDS, msg);
			} else if (data.formid === 'form410931121') {
				const entr = Object.entries(data);
				let participants = [];
				for (let item of entr) {
					let splited = item[0].split('_');
					if (splited.length === 2) {
						let row = splited[0];
						let serial = splited[1] - 1;
						let value = item[1];
						let object = {};

						object[row] = value;
						participants[serial] = Object.assign(
							object,
							participants[serial]
						);
					}
				}

				const team = {
					regionID: regionID,
					universityName: data.universityName,
					facultyName: data.facultyName,
					name: data.teamName,
					membersQuantity: participants.length,
				};

				const teamUUID = await TeamService.create(team);
				if (!teamUUID) {
					ApiError.BadRequest('Ошибка создания команды');
				}

				for (let participant of participants) {
					participant['teamID'] = teamUUID;
					participant['regionID'] = regionID;
					participant['universityName'] = data.universityName;
					participant['facultyName'] = data.facultyName;
					participant['teamName'] = data.teamName;
					await ParticipantService.create(participant);
				}
			} else {
				ApiError.BadRequest('FORM_ID');
			}
			//const condition = { regionID: req.user.userRegionID };
			//const data = await Service.getAll(condition);
			return res.status(200).send('ok');
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new HandlerController();
