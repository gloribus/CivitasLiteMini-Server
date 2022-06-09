const MarafonParticipantService = require('../../Services/marafonParticipant');
const MarafonIdeaService = require('../../Services/marafonIdea');
const marafonParticipantModel = require('../../Models').marafonParticipant;
const EventService = require('../../Services/event');
const { Op } = require('sequelize');
const baseID = 2147480000;

function formatTelephone (phone) {
	let formattedTelephone;
	if (!phone) {
		formattedTelephone = '+7-000-000-00-00';
	}

	const numberValueReduced = (phone) => {
		return phone.replace(
			/^(\d{3})(\d{3})(\d{2})(\d{2})$/,
			'+7-$1-$2-$3-$4'
		);
	};

	switch (phone.length) {
		case 16:
			formattedTelephone = phone;
			break;
		case 11:
			formattedTelephone = numberValueReduced(phone.slice(1));
			break;
		case 12:
			formattedTelephone = numberValueReduced(phone.slice(2));
			break;
		case 15:
			formattedTelephone = '+7-' + numberValueReduced(phone.slice(2));
			break;
		default:
			formattedTelephone = '+7-000-000-00-00';
			break;
	}

	return formattedTelephone;
}

async function add (req) {
	const data = require('./data');
	try {
		const eventID = data.eventID;

		const event = await EventService.get({ id: eventID }, [
			'regionID',
			'locality',
			'school',
			'userID',
		]);

		const { regionID, locality, school } = event[0];

		if (!locality) {
			console.log('Код мероприятия не найден!');
			return false;
		}

		const lastID = await marafonParticipantModel.findOne({
			where: { vkID: { [Op.gte]: baseID } },
			attributes: ['vkID'],
			order: [['vkID', 'DESC']],
		});

		let mockVKID = parseInt(lastID.dataValues.vkID);

		await Promise.all(
			data.participants.map(async (item) => {
				item.idea.eventID = eventID;
				item.idea.serviceNote = 'manualAdd';
				item.idea.regionID = regionID;
				let ideaID;
				if (item.idea.id) {
					ideaID = item.idea.id;
				} else {
					ideaID = await MarafonIdeaService.create(item.idea);
				}

				const newParticipants = [];
				item.team.map((participant) => {
					if (!participant.vkID) {
						participant.vkID = mockVKID;
						mockVKID++;
					}

					participant.telephone = formatTelephone(
						participant.telephone
					);

					if (!participant.surname) {
						const fullname = participant.name.split(' ');
						participant.name = fullname[1];
						participant.surname = fullname[0];
					}

					participant.ideaID = ideaID;
					participant.eventID = eventID;

					participant.regionID = regionID;
					participant.locality = locality;
					participant.school = school;

					participant.serviceNote = 'manualAdd';

					newParticipants.push(participant);
				});
				await marafonParticipantModel.bulkCreate(newParticipants, {
					/* ignoreDuplicates: true, */
					logging: false,
				});
			})
		);

		return true;
	} catch (e) {
		console.log(e);
	}
}

module.exports = add;
