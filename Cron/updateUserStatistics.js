//const Service = require('../Services/regionStatistics');
//const MarafonParticipantService = require('../Services/marafonParticipant');
//const MarafonIdeaService = require('../Services/marafonIdea');
//const EventService = require('../Services/event');
//const UserService = require('../Services/user');

const UserModel = require('../Models').user;
const MarafonParticipantModel = require('../Models').marafonParticipant;
const MarafonIdeaModel = require('../Models').marafonIdea;
const EventModel = require('../Models').event;
const { Op } = require('sequelize');

async function update () {
	try {
		// Обнулить статистику в events и users

		const newStats = {};

		await UserModel.update(
			{ participantsCNT: 0, ideasCNT: 0, invitedCNT: 0 /* eventsCNT: 0 */ },
			{
				where: { userID: { [Op.not]: null } },
				logging: false,
			}
		);

		await EventModel.update(
			{ participantsCNT: 0, ideasCNT: 0 },
			{
				where: { id: { [Op.not]: null } },
				logging: false,
			}
		);

		const MarafonParticipantCNT = await MarafonParticipantModel.count({
			attributes: ['eventID'],
			group: 'eventID',
			where: { isDeleted: 0 },
			distinct: true,
			col: 'vkID',
			logging: false,
		});

		MarafonParticipantCNT.map((item) => {
			if (item.eventID !== null) {
				if (newStats[item.eventID] === undefined) {
					newStats[item.eventID] = {};
				}
				newStats[item.eventID]['participantsCNT'] = item.count;
			} else {
				console.log('NULLED Participants', item.count);
			}
		});

		// Пройти по списку, получить user по Event, добавить новое значение count

		const MarafonIdeaCNT = await MarafonIdeaModel.count({
			attributes: ['eventID'],
			group: 'eventID',
			where: { isDeleted: 0 },
			logging: false,
		});

		MarafonIdeaCNT.map((item) => {
			if (item.eventID !== null) {
				if (newStats[item.eventID] === undefined) {
					newStats[item.eventID] = {};
				}
				newStats[item.eventID]['ideasCNT'] = item.count;
			} else {
				console.log('NULLED Ideas', item.count);
			}
		});

		let data = {};
		for (let [id, value] of Object.entries(newStats)) {
			const event = await EventModel.findOne({
				attributes: ['id', 'userID'],
				where: { id },
				logging: false,
			});

			// update events
			await EventModel.update(value, {
				where: { id },
				logging: false,
			});

			if (data[event.userID] === undefined) {
				data[event.userID] = {};
			}

			/* 			if (data[event.userID].eventsCNT) {
				data[event.userID].eventsCNT =
					parseInt(data[event.userID].eventsCNT) + 1;
			} else {
				data[event.userID].eventsCNT = 1;
			} */

			if (value.participantsCNT > 0) {
				if (data[event.userID].participantsCNT) {
					data[event.userID].participantsCNT =
						parseInt(data[event.userID].participantsCNT) +
						parseInt(value.participantsCNT);
				} else {
					data[event.userID].participantsCNT = parseInt(
						value.participantsCNT
					);
				}
			}

			if (value.ideasCNT > 0) {
				if (data[event.userID].ideasCNT) {
					data[event.userID].ideasCNT =
						parseInt(data[event.userID].ideasCNT) +
						parseInt(value.ideasCNT);
				} else {
					data[event.userID].ideasCNT = parseInt(value.ideasCNT);
				}
			}
		}


		const invitedCNT = await UserModel.count({
			attributes: ['invitedBy'],
			group: 'invitedBy',
			logging: false,
		});

		invitedCNT.map((item) => {
			if (data[item.invitedBy] === undefined) {
				data[item.invitedBy] = {};
			}
			data[item.invitedBy].invitedCNT = item.count
		});

		for (let [userID, value] of Object.entries(data)) {
			await UserModel.update(value, {
				where: { userID },
				logging: false,
			});
		}

		/* const testReg = await Service.get({ regionID: 5 });
		if (testReg.length === 0) {
			await Service.init();
		}

		const MarafonParticipantStats =
			await MarafonParticipantService.getStats();
		const MarafonIdeaServiceStats = await MarafonIdeaService.getStats();
		const EventServiceStats = await EventService.getStats();
		const UserServiceStats = await UserService.getLineUp();

		const data = {};

		UserServiceStats.map((item) => {
			if (data[item.regionID] === undefined) {
				data[item.regionID] = {};
			}

			data[item.regionID]['activeCNT'] = item.active;
			data[item.regionID]['without_accessCNT'] = item.without_access;
		});

		MarafonParticipantStats.map((item) => {
			if (data[item.regionID] === undefined) {
				data[item.regionID] = {};
			}
			data[item.regionID]['participantsCNT'] = item.count;
		});

		MarafonIdeaServiceStats.map((item) => {
			if (data[item.regionID] === undefined) {
				data[item.regionID] = {};
			}
			data[item.regionID]['ideasCNT'] = item.count;
		});

		EventServiceStats.map((item) => {
			if (data[item.regionID] === undefined) {
				data[item.regionID] = {};
			}
			data[item.regionID]['eventsCNT'] = item.count;
		});

		for (let [id, regionStat] of Object.entries(data)) {
			Service.update(regionStat, id);
		} */
		//console.log(data);
		return true;
	} catch (e) {
		console.log(e);
	}
}

module.exports = update;
