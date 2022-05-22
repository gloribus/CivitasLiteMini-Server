const Inbox = require('../Utils/Inbox');

module.exports = function (req, res, next) {
	const method = req.method;

	if (method != 'GET' && method != 'PATCH') {
		Inbox.add({
			method,
			path: req.path,
			hostname: req.hostname,
			ip: req.ip,
			data: req.body,
		});
	}

	next();
};
