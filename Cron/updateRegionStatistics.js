const Service = require('../Services/regionStatistics');
const MarafonParticipantService = require('../Services/marafonParticipant');
const MarafonIdeaService = require('../Services/marafonIdea');
const EventService = require('../Services/event');
const UserService = require('../Services/user');

async function update() {
	try {
		const testReg = await Service.get({ regionID: 5 });
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
		}
		//console.log(data);
		return true;
	} catch (e) {
		console.log(e);
	}
}

module.exports = update;
