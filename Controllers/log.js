const Log = require('../Utils/log');

class LogController {
	async log(req, res, next) {
		try {
			Log.add({
				userID: req.user.userID,
				action: req.body.action,
				aimModel: req.body.aimModel,
				aimID: req.body.aimID,
			});
			return res.json({ success: true });
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new LogController();
