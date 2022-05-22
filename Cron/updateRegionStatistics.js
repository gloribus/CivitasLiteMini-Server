const Service = require('../Services/regionStatistics');
const MarafonParticipantService = require('../Services/marafonParticipant');
const MarafonIdeaService = require('../Services/marafonIdea');
const EventService = require('../Services/event');

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

		const data = {};

		MarafonParticipantStats.map((item) => {
			data[item.regionID] = {};
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

		return true;
	} catch (e) {
		console.log(e);
	}
}

module.exports = update;
