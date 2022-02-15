const ParticipantService = require('../Services/participant');
const TeamService = require('../Services/team');
const UserService = require('../Services/user');
const Bot = require('../Utils/bot');

// const { validationResult } = require('express-validator');
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
	async registration(req, res, next) {
		console.log('---registration---');
		console.log(req.body);
		try {
			const data = req.body;

			Object.keys(data).map(
				(k) => (data[k] = typeof data[k] == 'string' ? data[k].trim() : data[k])
			);
			const regionID = parseInt(data.regionID) || parseInt(data.regionIDFromLink);
			console.log(regionID);
			if (data.formid === 'form410944671') {
				// SEND TO VK
				const users = await UserService.getVKIDs(regionID);
				const vkIDS = [];
				const fromList = {'form410944671': {title: 'БПИ', action: 'Регистрация в турнире (одиночная)'}}
				users.map((user) => {vkIDS.push(user.vkID)});
				let msg =`🥳 Новая заявка с сайта ${fromList[data.formid].title}\n`+
				`${fromList[data.formid].action}\n---------\n`+
				`${data.name}\n`+
				`${data.surname}\n`+
				`${data.birthday}\n`+
				`${data.socialLink}\n`+
				`${data.telephone}\n`+
				`${data.universityName}\n`+
				`${data.facultyName}`;

				Bot.sendMsg(
					vkIDS,
					msg
				);
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
