const Model = require('../Models').log;

class Log {
	async add(data) {
		try {
			const created = await Model.create(data);
		} catch (e) {
			console.log('LOG ERROR:', e);
		}
	}
}

module.exports = new Log();
