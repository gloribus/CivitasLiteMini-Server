const casual = require('casual');
const TeamModel = require('../Models').team;
const ParticipantModel = require('../Models').participant;

class Mock {
	async fillTeamsParticipantsRandom() {
		const regions = [98,12,20,36,24,92,81,56,18,54,86,22,47,33,17,
			42,37,10,50,3,32,80,52,25,19,68,66,27,29,63,89,73,40,1,49
			,15,35,7,34,28,69,76,53,70,60,71,14,88,94,46,78,
			75,41,65,38,8,97,57,58,4,87];
		try {
			const start = new Date().getTime();
			async function generateTeamInDB(region) {
				let team = {};

				team.uuid = casual.uuid;
				team.name = casual.color_name;
				team.regionID = region;
				team.universityName = casual.state;
				team.facultyName = casual.title;
				team.membersQuantity = casual.integer(3, 5);

				await TeamModel.create(team);

				/* 	console.log('ADDED TO DB TEAM');
        console.log(team); */

				return team;
			}

			async function generateParticipantInDB(team) {
				for (let i = 0; i < team.membersQuantity; i++) {
					let participant = {};
					participant.teamID = team.uuid;
					participant.name = casual.first_name;
					participant.surname = casual.last_name;
					participant.telephone = `+7-${casual.phone}`;
					participant.birthday = casual.date('YYYY-MM-DD');
					participant.socialLink = `https://vk.com/${casual.username}`;
					participant.regionID = team.regionID;
					participant.teamName = team.name;
					participant.universityName = team.universityName;
					participant.facultyName = team.facultyName;

					/*
          Дополнительный стресс системы, в дальнейшем использовать 
          ParticipantModel.bulkCreate([{},{},{}]);
          */

					await ParticipantModel.create(participant);

					/* 		console.log('ADDED TO DB PARTICIPANT');
          console.log(participant); */
				}

				return 0;
			}

			let teamsAdded = 0;
			let participantsAdded = 0;
			let regionsAdded = 0;

			for (let regionID of regions) {
				regionsAdded++;
				/* console.log(`REGION ${regionID}`); */
				for (let i = 0; i < casual.integer(50, 100); i++) {
					teamsAdded++;
					const team = await generateTeamInDB(regionID);
					console.log(team.membersQuantity)
					participantsAdded += team.membersQuantity;
					generateParticipantInDB(team);
				}
			}

			console.log(`Добавлено регионов: ${regionsAdded}`);
			console.log(`Добавлено команд: ${teamsAdded}`);
			console.log(`Добавлено участников: ${participantsAdded}`);

			const end = new Date().getTime();

			console.log(`Заняло: ${end - start} мс`);

			/* 
      const team = generateTeam(14);
      
      generateParticipant(team); */
		} catch (e) {
			console.log('LOG ERROR:', e);
		}
	}
}

module.exports = new Mock();
