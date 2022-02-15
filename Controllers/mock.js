const Mock = require('../Utils/mock');

class MockController {
	async fillTeamsParticipantsRandom(req, res, next) {
		try {
			if (req.user.userStatus === 'admin') {
				Mock.fillTeamsParticipantsRandom();
				return res.json({ success: true });
			} else {
				res.json({ success: false, error: 'Давай дружить' });
			}
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new MockController();
