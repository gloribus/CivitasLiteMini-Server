const Model = require('../Models').inbox;

class Inbox {
	async add(data) {
		try {
			const created = await Model.create(data);
		} catch (e) {
			console.log('LOG ERROR:', e);
		}
	}
}

module.exports = new Inbox();
