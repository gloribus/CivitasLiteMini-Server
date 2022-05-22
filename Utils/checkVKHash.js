const crypto = require('crypto');

module.exports = function (appID, userID, secretKey, hash) {
	return (
		crypto
			.createHash('md5')
			.update(appID + userID + secretKey)
			.digest('hex') === hash
	);
};
